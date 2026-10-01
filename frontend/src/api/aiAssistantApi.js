import axiosClient from './axiosClient';

export const sendMessage = async (message) => {
  const response = await axiosClient.post('/ai-assistant/chat/', { message });
  return response.data;
};

export const getMessageHistory = async () => {
  const response = await axiosClient.get('/ai-assistant/messages/');
  return response.data;
};

export const uploadDocument = async (formData) => {
  const response = await axiosClient.post('/ai-assistant/documents/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const listDocuments = async () => {
  const response = await axiosClient.get('/ai-assistant/documents/');
  return response.data;
};

export const toggleDocumentActive = async (id) => {
  const response = await axiosClient.patch(`/ai-assistant/documents/${id}/toggle-active/`);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await axiosClient.delete(`/ai-assistant/documents/${id}/`);
  return response.data;
};

export const summarizeReport = async (reportId) => {
  const response = await axiosClient.post(`/ai-assistant/reports/${reportId}/summarize/`);
  return response.data;
};

export const getPatientAISummary = async (patientId) => {
  const response = await axiosClient.post(`/ai-assistant/patients/${patientId}/summary/`);
  return response.data;
};

