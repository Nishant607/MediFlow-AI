import axiosClient from './axiosClient';

export const listDoctors = async (departmentId) => {
  const params = {};
  if (departmentId) {
    params.department = departmentId;
  }
  const response = await axiosClient.get('/doctors/', { params });
  return response.data;
};

export const getAvailableSlots = async (doctorId, date) => {
  const response = await axiosClient.get(`/doctors/${doctorId}/available-slots/`, {
    params: { date },
  });
  return response.data;
};

export const listPendingDoctors = async () => {
  const response = await axiosClient.get('/doctors/pending/');
  return response.data;
};

export const approveDoctor = async (doctorId) => {
  const response = await axiosClient.patch(`/doctors/${doctorId}/approve/`);
  return response.data;
};
