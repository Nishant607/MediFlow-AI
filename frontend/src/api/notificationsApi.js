import axiosClient from './axiosClient';

export const getMyNotifications = async () => {
  const response = await axiosClient.get('/notifications/mine/');
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await axiosClient.patch(`/notifications/${id}/read/`);
  return response.data;
};

export const markAllRead = async () => {
  const response = await axiosClient.post('/notifications/mark-all-read/');
  return response.data;
};

export const triggerReminders = async () => {
  const response = await axiosClient.post('/notifications/trigger-reminders/');
  return response.data;
};
