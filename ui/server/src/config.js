import dotenv from 'dotenv';

dotenv.config();

const providerData = {
  fireworks_api_key: process.env.FIREWORKS_API_KEY || '',
  together_api_key: process.env.TOGETHER_API_KEY || '',
  sambanova_api_key: process.env.SAMBANOVA_API_KEY || '',
  openai_api_key: process.env.OPENAI_API_KEY || '',
  tavily_search_api_key: process.env.TAVILY_SEARCH_API_KEY || '',
};

// Remove empty values so we don't send an all-empty payload
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
};
