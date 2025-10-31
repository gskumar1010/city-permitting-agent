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
export const uploadDocument = ({ sessionId, documentType, file }) => {
  const formData = new FormData();
  formData.append('sessionId', sessionId);
  formData.append('documentType', documentType);
  formData.append('file', file);
  return client.post('/documents/upload', formData).then((res) => res.data);
};
export const fetchDocuments = (sessionId) => client.get(`/documents/${sessionId}`).then((res) => res.data);
export const saveApplication = (payload) => client.post('/application', payload).then((res) => res.data);
export const fetchEvaluationHistory = (sessionId) => client.get(`/evaluations/${sessionId}`).then((res) => res.data);
export const fetchSavedApplication = (sessionId) => client.get(`/application/${sessionId}`).then((res) => res.data);
export const fetchSession = (sessionId) => client.get(`/session/${sessionId}`).then((res) => res.data);
export const fetchDocumentLibrary = () => client.get('/document-library').then((res) => res.data);
