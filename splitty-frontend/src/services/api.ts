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

export interface ReceiptItem {
  name: string;
  quantity: number;
  price_eur: number;
}

export interface ProcessReceiptResponse {
  success: boolean;
  items: ReceiptItem[];
  total_eur: number;
  language: string;
}

export interface SplitBillResponse {
  [participant: string]: {
    items: ProcessedItem[];
    total: number;
  };
}

export const processReceipt = async (
  imageBase64: string
): Promise<ProcessReceiptResponse> => {
  const response = await axios.post(`${API_BASE_URL}/process-receipt`, {
    imageBase64: imageBase64,
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