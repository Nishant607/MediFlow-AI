import axiosClient from './axiosClient';

export const getAdminStats = async () => {
  const response = await axiosClient.get('/auth/admin/stats/');
  return response.data;
};

export const getAdminPatients = async (params = {}) => {
  const response = await axiosClient.get('/patients/', { params });
  return response.data;
};

export const getAllAppointments = async (params = {}) => {
  const response = await axiosClient.get('/appointments/all/', { params });
  return response.data;
};
