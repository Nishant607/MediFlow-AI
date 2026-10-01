import axiosClient from './axiosClient';

export const bookAppointment = async (data) => {
  const response = await axiosClient.post('/appointments/', data);
  return response.data;
};

export const getMyAppointments = async (filter = 'upcoming') => {
  const response = await axiosClient.get('/appointments/mine/', {
    params: { filter },
  });
  return response.data;
};

export const getDoctorSchedule = async (date) => {
  const params = {};
  if (date) {
    params.date = date;
  }
  const response = await axiosClient.get('/appointments/schedule/', { params });
  return response.data;
};

export const cancelAppointment = async (appointmentId) => {
  const response = await axiosClient.patch(`/appointments/${appointmentId}/cancel/`);
  return response.data;
};

export const getMyPatientCount = async () => {
  const response = await axiosClient.get('/appointments/my-patient-count/');
  return response.data;
};
