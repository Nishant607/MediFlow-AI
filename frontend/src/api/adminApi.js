import axiosClient from './axiosClient';

export const getAdminStats = async () => {
  const response = await axiosClient.get('/auth/admin/stats/');
  return response.data;
};
