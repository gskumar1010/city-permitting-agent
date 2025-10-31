import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');

const resolveDatabasePath = () => {
  const rawPath = process.env.DATABASE_PATH?.trim();
  if (!rawPath) {
    return path.resolve(projectRoot, 'server/data/app.db');
  }
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(projectRoot, rawPath);
};

const providerData = {
  fireworks_api_key: process.env.FIREWORKS_API_KEY || '',
  together_api_key: process.env.TOGETHER_API_KEY || '',
  sambanova_api_key: process.env.SAMBANOVA_API_KEY || '',
  openai_api_key: process.env.OPENAI_API_KEY || '',
  tavily_search_api_key: process.env.TAVILY_SEARCH_API_KEY || '',
};

const filteredProviderData = Object.fromEntries(
  Object.entries(providerData).filter(([, value]) => typeof value === 'string' && value.length > 0),
);

export const config = {
  port: Number(process.env.PORT || 5174),
  llamaStack: {
    baseUrl: process.env.LLAMA_STACK_ENDPOINT || 'http://localhost:8321',
    apiKey: process.env.LLAMA_STACK_API_KEY || null,
    providerData: filteredProviderData,
  },
  smarty: {
    authId: process.env.SMARTY_AUTH_ID || '',
    authToken: process.env.SMARTY_AUTH_TOKEN || '',
  },
  database: {
    path: resolveDatabasePath(),
  },
};
