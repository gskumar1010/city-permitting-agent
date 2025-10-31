import express from 'express';
import cors from 'cors';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { config } from './config.js';
import { createLlamaStackClient } from './llamaStackClient.js';
import { database } from './database.js';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.disable('x-powered-by');


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../../dist');
const publicPath = path.resolve(__dirname, '../../public');
const userFilesRoot = path.join(publicPath, 'users');
fs.mkdirSync(userFilesRoot, { recursive: true });

app.use('/users', express.static(path.join(publicPath, 'users')));

const sanitizePathSegment = (value) => (value || '').replace(/[^a-zA-Z0-9-_]/g, '');
const toPublicRelativePath = (filePath) => path.relative(publicPath, filePath).split(path.sep).filter(Boolean).join('/');
const buildDocumentPayload = (record) => {
  const relativePath = (record.relativePath || '').replace(/\\/g, '/').replace(/^\/+/, '');
  return {
    id: record.id,
    sessionId: record.sessionId,
    documentType: record.documentType,
    originalName: record.originalName,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
    uploadedAt: record.createdAt,
    url: `/${relativePath}`
  };
};

const removeFile = (filePath) => {
  if (!filePath) return;
  fs.unlink(filePath, (error) => {
    if (error && error.code !== 'ENOENT') {
      console.warn(`Failed to delete file ${filePath}:`, error);
    }
  });
};

const removeSessionFiles = (sessionId) => {
  const sanitized = sanitizePathSegment(sessionId);
  if (!sanitized) return;
  const sessionDir = path.join(userFilesRoot, sanitized);
  fs.rm(sessionDir, { recursive: true, force: true }, (error) => {
    if (error && error.code !== 'ENOENT') {
      console.warn(`Failed to clean uploads for session ${sessionId}:`, error);
    }
  });
};

const uploadStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId.trim() : '';
    const sanitized = sanitizePathSegment(sessionId);
    if (!sanitized) {
      const error = new Error('A valid sessionId is required.');
      error.code = 'INVALID_SESSION_ID';
      return cb(error);
    }
    const targetDir = path.join(userFilesRoot, sanitized);
    fs.mkdirSync(targetDir, { recursive: true });
    cb(null, targetDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const baseName = path.basename(file.originalname || 'document', ext).replace(/[^a-zA-Z0-9-_]/g, '_') || 'document';
    const timestamp = Date.now();
    cb(null, `${baseName.slice(0, 60)}-${timestamp}${ext}`);
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

const uploadSingleDocument = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large. Maximum upload size is 25 MB.'
        : error.message || 'Upload failed.';
      return res.status(status).json({ message });
    }
    next();
  });
};


const defaultLlamaUrl = (() => {
  try {
    return new URL(config.llamaStack.baseUrl || 'http://localhost:8321');
  } catch (_) {
    return new URL('http://localhost:8321');
  }
})();

const sessions = new Map();

const getSessionFromStore = (sessionId) => {
  if (!sessionId) {
    return null;
  }
  if (sessions.has(sessionId)) {
    return sessions.get(sessionId);
  }
  const persisted = database.getSession(sessionId);
  if (!persisted) {
    return null;
  }
  const baseUrl = persisted.baseUrl || defaultLlamaUrl.origin || defaultLlamaUrl.toString();
  const session = {
    sessionId: persisted.sessionId,
    baseUrl,
    vectorDbId: persisted.vectorDbId,
    client: createLlamaStackClient(baseUrl),
    messages: Array.isArray(persisted.messages) && persisted.messages.length > 0
      ? persisted.messages.map((message) => ({
        role: message.role,
        content: message.content,
      }))
      : buildSessionPrompt(),
  };
  sessions.set(sessionId, session);
  return session;
};


const MODEL_ID = 'llama-4-scout-17b-16e-w4a16';
const EMBEDDING_MODEL = 'all-MiniLM-L6-v2';
const EMBEDDING_DIMENSION = 384;

const PERMIT_DOCS = [
  {
    id: 'food_rules_2017',
    description: 'Denver Food Rules and Regulations April 2017',
    urls: [
      'https://www.denvergov.org/files/assets/public/public-health-and-environment/documents/phi/food/revisedfoodrulesandregulationsapril2017compressed.pdf',
      'http://denvergov.org/content/dam/denvergov/Portals/771/documents/PHI/Food/RevisedFoodRulesandregulationsApril2017compressed.pdf',
    ],
  },
  {
    id: 'mobile_unit_guide_2022',
    description: 'Denver Mobile Unit Guide 2022',
    urls: [
      'https://denver.prelive.opencities.com/files/assets/public/v/1/public-health-and-environment/documents/phi/2022_mobileunitguide.pdf',
    ],
  },
];

const FALLBACK_CONTENT = `DENVER MOBILE FOOD TRUCK PERMIT REQUIREMENTS

LICENSE REQUIREMENTS:
- City and County of Denver 'Retail Food Establishment-Mobile' license required
- Complete Mobile Plan Review Packet submission
- Processing time: 30 days during busy season
- Annual renewal required

WATER SYSTEM REQUIREMENTS:
- Hand washing sink: minimum 10 inches wide x 10 inches long x 5 inches deep
- Water temperature: 100°F to 120°F at the faucet
- Soap and single-use paper towels required at all times
- Minimum 10 gallons clean water tank OR 3 gallons per hour of operation (whichever is greater)
- Wastewater tank must be at least 15% larger than clean water tank
- All water tanks must be NSF-approved and labeled

COMMISSARY REQUIREMENTS:
- Must operate from an approved commissary facility
- Report to commissary daily for food preparation, cleaning, and servicing
- Affidavit of Commissary form required
- Commissary must be licensed by Denver or approved jurisdiction

LOCATION RESTRICTIONS:
- Cannot operate in Central Business District without special permit
- 300 feet minimum from public parks (unless during special event with permission)
- 200 feet minimum from other food trucks
- 200 feet minimum from eating/drinking establishments (unless written consent)
- 50 feet minimum from residential zoning districts
- Cannot block fire hydrants, crosswalks, or handicap access

EQUIPMENT REQUIREMENTS:
- Fire suppression system required for equipment producing grease-laden vapors
- Type I hood system required for grills, fryers, etc.
- Commercial-grade equipment only (no residential appliances)
- All equipment must be NSF or equivalent certified
- Adequate ventilation system required

FOOD SAFETY REQUIREMENTS:
- All food stored minimum 6 inches above ground
- Cold potentially hazardous food: 41°F or below
- Hot potentially hazardous food: 135°F or above
- Accurate thermometers required (± 2°F accuracy)
- Food protection from contamination at all times
- No bare hand contact with ready-to-eat foods

STRUCTURAL REQUIREMENTS:
- Floors: smooth, non-absorbent, easily cleanable
- Walls and ceilings: light-colored, smooth, easily cleanable
- Adequate lighting: minimum 10 foot-candles on food prep surfaces
- Sneeze guards required for customer self-service
- Waste containers with lids required

DOCUMENTATION REQUIRED FOR PERMIT:
1. Completed application form with fees
2. Vehicle registration and proof of ownership
3. Insurance certificate (general liability)
4. Commissary affidavit (signed by commissary owner)
5. Mobile unit floor plan (to scale)
6. Equipment specification sheets
7. Menu list
8. Water system diagram
9. Waste disposal plan
10. Certified food manager certificate (at least one per unit)

INSPECTION REQUIREMENTS:
- Initial inspection required before permit issuance
- Routine unannounced inspections throughout operation
- Must maintain score of 80 or above
- Critical violations must be corrected immediately
- Re-inspection fee applies for follow-up inspections

FEES (Subject to change):
- New mobile unit application: varies by unit type
- Annual renewal: varies by unit type
- Re-inspection fee: if applicable
- Late renewal penalty: if applicable`;

const asyncHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error(error);
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: error.message };
    res.status(status).json(data);
  }
};

app.get('/api/address-autocomplete', asyncHandler(async (req, res) => {
  if (!config.smarty?.authId || !config.smarty?.authToken) {
    return res.json({ suggestions: [] });
  }
  const search = String(req.query.search ?? '').trim();
  const selected = req.query.selected ? String(req.query.selected) : undefined;
  if (!search) {
    return res.json({ suggestions: [] });
  }
  const url = new URL('https://us-autocomplete-pro.api.smarty.com/lookup');
  url.searchParams.set('auth-id', config.smarty.authId);
  url.searchParams.set('auth-token', config.smarty.authToken);
  url.searchParams.set('search', search);
  url.searchParams.set('country', 'us');
  url.searchParams.set('source', 'postal');
  url.searchParams.set('prefer_geolocation', 'city');
  if (selected) {
    url.searchParams.set('selected', selected);
  }
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Smarty autocomplete error: ${response.status}`);
  }
  const data = await response.json();
  res.json({ suggestions: data?.suggestions ?? [] });
}));

const pushLog = (logs, type, message, notify) => {
  const entry = {
    id: uuidv4(),
    type,
    message,
    timestamp: Date.now(),
  };
  logs.push(entry);
  if (notify) {
    notify(entry);
  }
  return entry;
};

const buildSessionPrompt = () => [
  {
    role: 'system',
    content: `You are an expert City Permitting AI Agent for Denver food truck permits.

Your responsibilities:
1. Review permit applications for completeness and accuracy
2. Check compliance with Denver food truck regulations
3. Identify missing information or errors
4. Provide clear, actionable feedback with specific regulation references
5. Generate evaluation scorecards with scores from 0-100

Always be professional, thorough, and cite specific regulations when providing feedback.`,
  },
];

const fetchPdfAsText = async (urls, description, logs, notify) => {
  for (const url of urls) {
    try {
      pushLog(logs, 'info', `Attempting to download: ${description}`, notify);
      const response = await fetch(url, { redirect: 'follow' });
      if (!response.ok) {
        pushLog(logs, 'warning', `Status ${response.status} from ${url}`, notify);
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const parsed = await pdf(buffer);
      if (parsed.text && parsed.text.trim().length > 100) {
        pushLog(logs, 'success', `Downloaded: ${description}`, notify);
        return parsed.text;
      }
      pushLog(logs, 'warning', `Insufficient content extracted from ${url}`, notify);
    } catch (error) {
      pushLog(logs, 'warning', `Failed to download from ${url}: ${error.message}`, notify);
    }
  }
  return null;
};

const normalizeProtocol = (value, fallback) => {
  if (!value) return fallback;
  return value.replace(/:$/, '').toLowerCase();
};

const performInitialization = async (params = {}, notify) => {
  const logs = [];
  const rawProtocol = Array.isArray(params.protocol) ? params.protocol[0] : params.protocol;
  const rawHost = Array.isArray(params.host) ? params.host[0] : params.host;
  const rawPort = Array.isArray(params.port) ? params.port[0] : params.port;

  let baseUrl;

  if (rawHost && /^https?:\/\//i.test(rawHost)) {
    const parsed = new URL(rawHost);
    baseUrl = parsed.origin;
  } else {
    const sanitizedHost = rawHost?.replace(/^https?:\/\//i, '') || defaultLlamaUrl.hostname;
    const finalPort = rawPort ?? defaultLlamaUrl.port;
    const finalProtocol = normalizeProtocol(rawProtocol, defaultLlamaUrl.protocol.replace(':', ''));
    baseUrl = `${finalProtocol}://${sanitizedHost}${finalPort ? `:${finalPort}` : ''}`;
  }

  try {
    pushLog(logs, 'info', `Connecting to Llama Stack at ${baseUrl}...`, notify);
    const client = createLlamaStackClient(baseUrl);
    await client.get('/v1/models');
    pushLog(logs, 'success', 'Connected to Llama Stack', notify);

    pushLog(logs, 'info', 'Loading permit documents...', notify);
    const documents = [];
    for (const doc of PERMIT_DOCS) {
      const text = await fetchPdfAsText(doc.urls, doc.description, logs, notify);
      if (text) {
        documents.push({
          document_id: doc.id,
          content: text,
          mime_type: 'text/plain',
          metadata: {
            description: doc.description,
            source: doc.urls[0],
            type: 'permit_requirements',
          },
        });
      }
    }

    if (documents.length === 0) {
      pushLog(logs, 'warning', 'Could not download PDFs. Using fallback permit requirements.', notify);
      documents.push({
        document_id: 'fallback_requirements',
        content: FALLBACK_CONTENT,
        mime_type: 'text/plain',
        metadata: {
          source: 'fallback',
          description: 'Denver Permit Requirements (Fallback)',
          type: 'permit_requirements',
        },
      });
    }

    pushLog(logs, 'info', 'Fetching providers...', notify);
    const providersResponse = await client.get('/v1/providers');
    const providersPayload = providersResponse.data ?? [];
    const providerList = Array.isArray(providersPayload)
      ? providersPayload
      : Array.isArray(providersPayload.items)
        ? providersPayload.items
        : Array.isArray(providersPayload.data)
          ? providersPayload.data
          : [];

    if (!Array.isArray(providerList) || providerList.length === 0) {
      pushLog(logs, 'warning', 'No providers returned by Llama Stack.', notify);
    }

    const vectorProvider = providerList.find((provider) => provider?.api === 'vector_io');
    if (!vectorProvider) {
      const errorMessage = 'No vector_io provider available in Llama Stack.';
      pushLog(logs, 'error', errorMessage, notify);
      const error = new Error(errorMessage);
      error.status = 400;
      error.logs = logs;
      throw error;
    }

    const vectorDbId = `permit-db-${uuidv4().slice(0, 8)}`;
    pushLog(logs, 'info', `Registering vector database ${vectorDbId}...`, notify);
    await client.post('/v1/vector-dbs', {
      vector_db_id: vectorDbId,
      provider_id: vectorProvider.provider_id,
      embedding_model: EMBEDDING_MODEL,
      embedding_dimension: EMBEDDING_DIMENSION,
    });

    pushLog(logs, 'info', 'Ingesting documents into vector database...', notify);
    await client.post('/v1/tool-runtime/rag-tool/insert', {
      vector_db_id: vectorDbId,
      documents,
      chunk_size_in_tokens: 1024,
    });
    pushLog(logs, 'success', 'Vector database ready.', notify);

    const sessionId = uuidv4();
    const session = {
      sessionId,
      baseUrl,
      client,
      vectorDbId,
      messages: buildSessionPrompt(),
    };
    sessions.set(sessionId, session);
    database.saveSession({ sessionId, baseUrl, vectorDbId });
    database.saveMessages(sessionId, session.messages);

    pushLog(logs, 'success', 'Initialization complete.', notify);

    return { sessionId, vectorDbId, logs };
  } catch (error) {
    if (!error.logs) {
      pushLog(logs, 'error', `Initialization failed: ${error.message || String(error)}`, notify);
      error.logs = logs;
    }
    throw error;
  }
};

app.post('/api/initialize-agent', asyncHandler(async (req, res) => {
  const result = await performInitialization(req.body, null);
  res.json(result);
}));

const sendSse = (res, event, payload) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

app.get('/api/initialize-agent/stream', asyncHandler(async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders?.();

  const notify = (entry) => sendSse(res, 'log', entry);

  try {
    const result = await performInitialization(req.query, notify);
    sendSse(res, 'complete', { sessionId: result.sessionId, vectorDbId: result.vectorDbId, logs: result.logs });
  } catch (error) {
    sendSse(res, 'error', { message: error.message || 'Initialization failed', status: error.status || 500, logs: error.logs || [] });
  } finally {
    sendSse(res, 'end', {});
    res.end();
  }
}));



app.post('/api/documents/upload', uploadSingleDocument, asyncHandler(async (req, res) => {
  const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId.trim() : '';
  const documentType = typeof req.body?.documentType === 'string' ? req.body.documentType.trim() : '';

  if (!sessionId) {
    if (req.file?.path) {
      removeFile(req.file.path);
    }
    return res.status(400).json({ message: 'sessionId is required.' });
  }

  if (!documentType) {
    if (req.file?.path) {
      removeFile(req.file.path);
    }
    return res.status(400).json({ message: 'documentType is required.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'file is required.' });
  }

  const sessionRecord = database.getSession(sessionId);
  if (!sessionRecord) {
    removeFile(req.file.path);
    return res.status(404).json({ message: 'Session not found.' });
  }

  const relativePath = toPublicRelativePath(req.file.path);
  const documentRecord = database.recordDocument({
    sessionId,
    documentType,
    originalName: req.file.originalname || req.file.filename,
    storedName: req.file.filename,
    relativePath,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
  });

  res.json({ document: buildDocumentPayload(documentRecord) });
}));

app.get('/api/documents/:sessionId', asyncHandler(async (req, res) => {
  const sessionId = typeof req.params.sessionId === 'string' ? req.params.sessionId.trim() : '';
  if (!sessionId) {
    return res.status(400).json({ message: 'sessionId is required.' });
  }
  const sessionRecord = database.getSession(sessionId);
  if (!sessionRecord) {
    return res.status(404).json({ message: 'Session not found.' });
  }
  const documents = (sessionRecord.documents || database.getDocuments(sessionId)).map((doc) => buildDocumentPayload(doc));
  res.json({ documents });
}));


const extractRagContext = (ragData) => {
  const chunks = ragData?.content ?? ragData?.results ?? [];
  const texts = [];
  for (const chunk of chunks) {
    if (typeof chunk === 'string') {
      texts.push(chunk);
    } else if (chunk?.text) {
      texts.push(chunk.text);
    } else if (Array.isArray(chunk?.content)) {
      chunk.content.forEach((item) => {
        if (item?.text) texts.push(item.text);
      });
    }
  }
  return texts;
};

const chatWithSession = async (session, prompt) => {
  const { client, vectorDbId, messages } = session;
  const ragResponse = await client.post('/v1/tool-runtime/rag-tool/query', {
    content: prompt,
    vector_db_ids: [vectorDbId],
  });
  const ragContext = extractRagContext(ragResponse.data);
  let enhancedPrompt = prompt;
  if (ragContext.length) {
    enhancedPrompt = `${prompt}\n\nRELEVANT DENVER REGULATIONS:\n${ragContext.join('\n\n')}\n\nBase your response on the regulations provided above.`;
  }

  messages.push({ role: 'user', content: enhancedPrompt });
  database.appendMessage(session.sessionId, { role: 'user', content: enhancedPrompt });

  const completionResponse = await client.post('/v1/inference/chat-completion', {
    model_id: MODEL_ID,
    messages,
  });
  const content = completionResponse.data?.completion_message?.content
    ?? completionResponse.data?.choices?.[0]?.message?.content
    ?? JSON.stringify(completionResponse.data);

  messages.push({ role: 'assistant', content });
  database.appendMessage(session.sessionId, { role: 'assistant', content });
  database.saveSession({ sessionId: session.sessionId, baseUrl: session.baseUrl, vectorDbId });
  return { answer: content, context: ragContext };
};

app.post('/api/query', asyncHandler(async (req, res) => {
  const { sessionId, prompt } = req.body || {};
  if (!sessionId || !prompt) {
    return res.status(400).json({ message: 'sessionId and prompt are required.' });
  }
  const session = getSessionFromStore(sessionId);
  if (!session) {
    return res.status(404).json({ message: 'Session not found.' });
  }
  const result = await chatWithSession(session, prompt);
  res.json(result);
}));

const parseEvaluation = (responseText) => {
  try {
    const match = responseText.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch (error) {
    console.warn('Failed to parse evaluation JSON', error);
  }
  return {
    overall_score: 0,
    recommendation: 'NEEDS_REVIEW',
    raw_response: responseText,
  };
};

app.post('/api/evaluate', asyncHandler(async (req, res) => {
  const { sessionId, application } = req.body || {};
  if (!sessionId || !application) {
    return res.status(400).json({ message: 'sessionId and application are required.' });
  }
  const session = getSessionFromStore(sessionId);
  if (!session) {
    return res.status(404).json({ message: 'Session not found.' });
  }

  const evaluationPrompt = `Evaluate this Denver food truck permit application:\n\nAPPLICATION DATA:\n${JSON.stringify(application, null, 2)}\n\nProvide a detailed evaluation in JSON format with:\n{\n  "overall_score": <0-100>,\n  "recommendation": "APPROVED" | "NEEDS_REVISION" | "REJECTED",\n  "categories": {\n    "completeness": {"score": <0-100>, "findings": [...], "required_actions": [...]},\n    "accuracy": {"score": <0-100>, "findings": [...], "required_actions": [...]},\n    "compliance": {"score": <0-100>, "findings": [...], "required_actions": [...]},\n    "documentation": {"score": <0-100>, "findings": [...], "required_actions": [...]},\n    "safety_requirements": {"score": <0-100>, "findings": [...], "required_actions": [...]}\n  },\n  "summary": "<brief summary>",\n  "next_steps": [...]\n}`;

  const { answer } = await chatWithSession(session, evaluationPrompt);
  const evaluation = parseEvaluation(answer);
  if (!evaluation.raw_response) {
    evaluation.raw_response = answer;
  }
  res.json({ evaluation });
}));

app.post('/api/reset', (req, res) => {
  const { sessionId } = req.body || {};
  if (sessionId) {
    sessions.delete(sessionId);
    database.deleteSession(sessionId);
    removeSessionFiles(sessionId);
  }
  res.json({ status: 'ok' });
});

app.get('/api/health', (_req, res) => {
  // TODO how do we manage this with Openshift?
  res.json({ status: 'ok' });

});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
  console.log(`SQLite database path: ${database.path}`);
});
