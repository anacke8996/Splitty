import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface ReceiptItem {
  item: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
  shared_by?: string[];
}

interface ProcessedItem {
  item: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
}

async function convertPrices(
  items: ProcessedItem[], 
  fromCurrency: string, 
  toCurrency: string
): Promise<ProcessedItem[]> {
  if (fromCurrency === toCurrency) {
    return items;
  }

  try {
    const response = await axios.get(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.FREECURRENCY_API_KEY}&currencies=${toCurrency}&base_currency=${fromCurrency}`
    );

    const rate = response.data.data[toCurrency];
    
    if (!rate) {
      console.error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
      return items;
    }

    console.log(`Exchange rate ${fromCurrency} to ${toCurrency}: ${rate}`);

    return items.map(item => ({
      ...item,
      converted_price: Number((item.price * rate).toFixed(2)),
      converted_total: Number((item.total * rate).toFixed(2))
    }));

  } catch (error) {
    console.error('Failed to get exchange rate:', error);
    return items;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, fromCurrency, toCurrency } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({ error: 'Both fromCurrency and toCurrency are required' });
    }

    // Convert the items to the format expected by convertPrices
    const processedItems: ProcessedItem[] = items.map((item: ReceiptItem) => ({
      item: item.item,
      price: item.price,
      qty: item.qty,
      total: item.total,
      converted_price: item.converted_price,
      converted_total: item.converted_total
    }));

    const convertedItems = await convertPrices(processedItems, fromCurrency, toCurrency);

    // Convert back to ReceiptItem format
    const result: ReceiptItem[] = convertedItems.map((item, index) => ({
      item: item.item,
      price: item.price,
      qty: item.qty,
      total: item.total,
      converted_price: item.converted_price || item.price,
      converted_total: item.converted_total || item.total,
      shared_by: items[index].shared_by || []
    }));

    res.status(200).json({ 
      success: true, 
      items: result 
    });

  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({ 
      error: 'Internal server error during currency conversion' 
    });
  }
} 