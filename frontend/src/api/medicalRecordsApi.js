import axiosClient from './axiosClient';

export const uploadReport = async (formData) => {
  const response = await axiosClient.post('/medical-records/reports/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getMyReports = async () => {
  const response = await axiosClient.get('/medical-records/reports/mine/');
  return response.data;
};

export const downloadReport = async (id) => {
  const response = await axiosClient.get(`/medical-records/reports/${id}/download/`, {
    responseType: 'blob',
  });
  return response;
};

export const getMyPrescriptions = async () => {
  const response = await axiosClient.get('/medical-records/consultations/mine/');
  return response.data;
};

export const submitConsultation = async (payload) => {
  const response = await axiosClient.post('/medical-records/consultations/', payload);
  return response.data;
};

export const getPatientReportsForDoctor = async (patientId) => {
  const response = await axiosClient.get(`/medical-records/reports/patient/${patientId}/`);
  return response.data;
};

export const getPatientHistoryForDoctor = async (patientId) => {
  const response = await axiosClient.get(`/medical-records/consultations/patient/${patientId}/`);
  return response.data;
};
