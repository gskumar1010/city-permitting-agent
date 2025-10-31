import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fallbackDatabasePath = path.resolve(__dirname, '../data/app.db');
const databasePath = config.database?.path ? config.database.path : fallbackDatabasePath;

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    base_url TEXT NOT NULL,
    vector_db_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_session_created
    ON messages(session_id, created_at, id);

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    mime_type TEXT,
    size_bytes INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_documents_session_created
    ON documents(session_id, created_at, id);
`);

const upsertSessionStmt = db.prepare(`
  INSERT INTO sessions (session_id, base_url, vector_db_id, created_at, updated_at)
  VALUES (@sessionId, @baseUrl, @vectorDbId, @timestamp, @timestamp)
  ON CONFLICT(session_id) DO UPDATE SET
    base_url = excluded.base_url,
    vector_db_id = excluded.vector_db_id,
    updated_at = excluded.updated_at
`);

const deleteSessionStmt = db.prepare('DELETE FROM sessions WHERE session_id = ?');
const selectSessionStmt = db.prepare('SELECT session_id, base_url, vector_db_id, created_at, updated_at FROM sessions WHERE session_id = ?');
const selectAllSessionsStmt = db.prepare('SELECT session_id, base_url, vector_db_id, created_at, updated_at FROM sessions ORDER BY updated_at DESC');
const deleteMessagesStmt = db.prepare('DELETE FROM messages WHERE session_id = ?');
const insertMessageStmt = db.prepare(`
  INSERT INTO messages (session_id, role, content, created_at)
  VALUES (@sessionId, @role, @content, @timestamp)
`);
const selectMessagesStmt = db.prepare(`
  SELECT role, content, created_at
  FROM messages
  WHERE session_id = ?
  ORDER BY created_at, id
`);

const insertDocumentStmt = db.prepare(`
  INSERT INTO documents (
    session_id,
    document_type,
    original_name,
    stored_name,
    relative_path,
    mime_type,
    size_bytes,
    created_at
  ) VALUES (
    @sessionId,
    @documentType,
    @originalName,
    @storedName,
    @relativePath,
    @mimeType,
    @sizeBytes,
    @timestamp
  )
`);

const selectDocumentsStmt = db.prepare(`
  SELECT id, session_id, document_type, original_name, stored_name, relative_path, mime_type, size_bytes, created_at
  FROM documents
  WHERE session_id = ?
  ORDER BY created_at DESC, id DESC
`);

const deleteDocumentStmt = db.prepare('DELETE FROM documents WHERE id = ? AND session_id = ?');

const replaceMessages = db.transaction((sessionId, messages) => {
  deleteMessagesStmt.run(sessionId);
  messages.forEach((message) => {
    insertMessageStmt.run({
      sessionId,
      role: message.role,
      content: message.content,
      timestamp: message.createdAt || new Date().toISOString(),
    });
  });
});

export const database = {
  path: databasePath,
  saveSession({ sessionId, baseUrl, vectorDbId }) {
    const timestamp = new Date().toISOString();
    upsertSessionStmt.run({ sessionId, baseUrl, vectorDbId, timestamp });
  },
  saveMessages(sessionId, messages) {
    replaceMessages(sessionId, messages);
  },
  appendMessage(sessionId, { role, content, createdAt }) {
    insertMessageStmt.run({
      sessionId,
      role,
      content,
      timestamp: createdAt || new Date().toISOString(),
    });
  },
  getSession(sessionId) {
    const session = selectSessionStmt.get(sessionId);
    if (!session) {
      return null;
    }
    const messages = selectMessagesStmt.all(sessionId).map((row) => ({
      role: row.role,
      content: row.content,
      createdAt: row.created_at,
    }));
    const documents = selectDocumentsStmt.all(sessionId).map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      documentType: row.document_type,
      originalName: row.original_name,
      storedName: row.stored_name,
      relativePath: row.relative_path,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      createdAt: row.created_at,
    }));
    return {
      sessionId: session.session_id,
      baseUrl: session.base_url,
      vectorDbId: session.vector_db_id,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      messages,
      documents,
    };
  },
  getSessions() {
    return selectAllSessionsStmt.all().map((row) => ({
      sessionId: row.session_id,
      baseUrl: row.base_url,
      vectorDbId: row.vector_db_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },
  deleteSession(sessionId) {
    deleteSessionStmt.run(sessionId);
  },
  recordDocument({ sessionId, documentType, originalName, storedName, relativePath, mimeType, sizeBytes }) {
    const timestamp = new Date().toISOString();
    const result = insertDocumentStmt.run({
      sessionId,
      documentType,
      originalName,
      storedName,
      relativePath,
      mimeType,
      sizeBytes,
      timestamp,
    });
    return {
      id: result.lastInsertRowid,
      sessionId,
      documentType,
      originalName,
      storedName,
      relativePath,
      mimeType,
      sizeBytes,
      createdAt: timestamp,
    };
  },
  getDocuments(sessionId) {
    return selectDocumentsStmt.all(sessionId).map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      documentType: row.document_type,
      originalName: row.original_name,
      storedName: row.stored_name,
      relativePath: row.relative_path,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      createdAt: row.created_at,
    }));
  },
  deleteDocument(sessionId, documentId) {
    deleteDocumentStmt.run(documentId, sessionId);
  },
};
