import api from './axiosClient';

export const getAuditLogs = (actionFilter = '') => {
  const params = {};
  if (actionFilter) {
    params.action = actionFilter;
  }
  return api.get('/audit/logs/', { params }).then((res) => res.data);
};
