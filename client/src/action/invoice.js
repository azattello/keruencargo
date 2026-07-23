import axios from 'axios';
import config from '../config';

export const createInvoice = async (userId, invoiceData) => {
  const response = await axios.post(`${config.apiUrl}/api/user/${userId}/invoice`, invoiceData);
  return response.data;
};

export const updateInvoice = async (userId, invoiceId, updatedData) => {
  const response = await axios.put(`${config.apiUrl}/api/user/${userId}/invoice/${invoiceId}`, updatedData);
  return response.data;
};

export const deleteInvoice = async (userId, invoiceId) => {
  const response = await axios.delete(`${config.apiUrl}/api/user/${userId}/invoice/${invoiceId}`);
  return response.data;
};

export const markInvoiceAsPaid = async (userId, invoiceId) => {
  const response = await axios.put(`${config.apiUrl}/api/user/${userId}/invoice/${invoiceId}/pay`);
  return response.data;
};
