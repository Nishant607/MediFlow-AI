import axiosClient from './axiosClient';

export const getMyInvoices = async () => {
  const response = await axiosClient.get('/billing/invoices/mine/');
  return response.data;
};

export const getInvoiceDetail = async (id) => {
  const response = await axiosClient.get(`/billing/invoices/${id}/`);
  return response.data;
};

export const payInvoice = async (id) => {
  const response = await axiosClient.post(`/billing/invoices/${id}/pay/`);
  return response.data;
};

export const getAllInvoices = async () => {
  const response = await axiosClient.get('/billing/invoices/');
  return response.data;
};
