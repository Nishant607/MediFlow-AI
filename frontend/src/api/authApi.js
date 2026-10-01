import axiosClient from './axiosClient';

export const registerPatient = async (patientData) => {
  const response = await axiosClient.post('/auth/register/patient/', patientData);
  return response.data;
};

export const registerDoctor = async (doctorData) => {
  const response = await axiosClient.post('/auth/register/doctor/', doctorData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axiosClient.post('/auth/login/', credentials);
  return response.data;
};

export const refreshToken = async (refresh) => {
  const response = await axiosClient.post('/auth/refresh/', { refresh });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axiosClient.get('/auth/me/');
  return response.data;
};

export const getDepartments = async () => {
  const response = await axiosClient.get('/departments/');
  return response.data;
};
