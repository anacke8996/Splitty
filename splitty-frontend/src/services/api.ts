import axios from 'axios';

const API_BASE_URL = '/api';

export interface ProcessedItem {
  item: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
  shared_by?: string[];
}

export interface ProcessReceiptResponse {
  items: ProcessedItem[];
  originalCurrency: string;
  targetCurrency: string;
}

export interface SplitBillResponse {
  [participant: string]: {
    items: ProcessedItem[];
    total: number;
  };
}

export const processReceipt = async (
  imageData: string,
  targetCurrency: string = 'USD'
): Promise<ProcessReceiptResponse> => {
  const response = await axios.post(`${API_BASE_URL}/process-receipt`, {
    imageData,
    targetCurrency,
  });
  return response.data;
};

export const splitBill = async (
  items: ProcessedItem[],
  participants: string[]
): Promise<SplitBillResponse> => {
  const response = await axios.post(`${API_BASE_URL}/split-bill`, {
    items,
    participants,
  });
  return response.data;
}; 