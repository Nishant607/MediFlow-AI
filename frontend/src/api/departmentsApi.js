import api from './axiosClient';

export const getEmergencyContacts = () =>
  api.get('/departments/emergency-contacts/').then((res) => res.data);
