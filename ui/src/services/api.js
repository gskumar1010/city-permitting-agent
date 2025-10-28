import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 120000,
});

export const initializeAgent = (payload) => client.post('/initialize-agent', payload).then((res) => res.data);
export const initializeAgentStream = (params) => {
  const query = new URLSearchParams(
    Object.entries(params || {})
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)]),
  );
  return new EventSource(`/api/initialize-agent/stream?${query.toString()}`);
};
export const queryAgent = (payload) => client.post('/query', payload).then((res) => res.data);
export const evaluateApplication = (payload) => client.post('/evaluate', payload).then((res) => res.data);
export const resetSession = (payload) => client.post('/reset', payload).then((res) => res.data);
export const autocompleteAddress = (params) =>
  client.get('/address-autocomplete', { params }).then((res) => res.data);
