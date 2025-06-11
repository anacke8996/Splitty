const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
    processReceipt: `${API_BASE_URL}/api/process-receipt`,
    splitBill: `${API_BASE_URL}/api/split-bill`,
}; 