import axios from 'axios';
import { config } from './config.js';

const buildHeaders = () => {
  const headers = {};
  if (config.llamaStack.apiKey) {
    headers.Authorization = `Bearer ${config.llamaStack.apiKey}`;
  }
  if (config.llamaStack.providerData && Object.keys(config.llamaStack.providerData).length > 0) {
    headers['X-LlamaStack-Provider-Data'] = JSON.stringify(config.llamaStack.providerData);
  }
  return headers;
};

export const createLlamaStackClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 120000,
  });

  client.interceptors.request.use((request) => {
    request.headers = {
      ...buildHeaders(),
      ...request.headers,
    };
    return request;
  });

  return client;
};

export const defaultLlamaStackClient = createLlamaStackClient(config.llamaStack.baseUrl);
