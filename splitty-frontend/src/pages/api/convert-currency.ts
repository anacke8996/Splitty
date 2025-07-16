import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface ReceiptItem {
  item: string;
  originalItem?: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
  shared_by?: string[];
  isSpecialItem?: boolean;
  specialType?: 'tax' | 'tip' | 'service_charge' | 'discount';
}

interface ProcessedItem {
  item: string;
  originalItem?: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
  isSpecialItem?: boolean;
  specialType?: 'tax' | 'tip' | 'service_charge' | 'discount';
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

    const rawRate = response.data.data[toCurrency];
    
    if (!rawRate) {
      console.error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
      return items;
    }

    // Round the exchange rate to 3 decimal places for more predictable calculations
    const rate = Number(rawRate.toFixed(3));

    console.log(`Exchange rate ${fromCurrency} to ${toCurrency}: ${rawRate} → rounded to ${rate}`);

    return items.map(item => ({
      ...item,
      converted_price: Number((item.price * rate).toFixed(2)),
      converted_total: Number((item.total * rate).toFixed(2)),
      isSpecialItem: item.isSpecialItem,
      specialType: item.specialType
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

    console.log(`🔄 Currency conversion request: ${fromCurrency} → ${toCurrency}`);
    console.log(`📊 Converting ${items?.length || 0} items`);

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    if (!fromCurrency || !toCurrency) {
      return res.status(400).json({ error: 'Both fromCurrency and toCurrency are required' });
    }

    // Convert the items to the format expected by convertPrices
    const processedItems: ProcessedItem[] = items.map((item: ReceiptItem) => ({
      item: item.item,
      originalItem: item.originalItem,
      price: item.price,
      qty: item.qty,
      total: item.total,
      converted_price: item.converted_price,
      converted_total: item.converted_total,
      isSpecialItem: item.isSpecialItem,
      specialType: item.specialType
    }));

    const convertedItems = await convertPrices(processedItems, fromCurrency, toCurrency);

    // Log conversion results for debugging
    console.log('✅ Conversion results:');
    convertedItems.forEach((item, index) => {
      const original = processedItems[index];
      console.log(`   ${item.item}: ${original.total} ${fromCurrency} → ${item.converted_total} ${toCurrency}`);
    });

    // Convert back to ReceiptItem format
    const result: ReceiptItem[] = convertedItems.map((item, index) => ({
      item: item.item,
      originalItem: item.originalItem,
      price: item.price,
      qty: item.qty,
      total: item.total,
      converted_price: item.converted_price || item.price,
      converted_total: item.converted_total || item.total,
      shared_by: items[index].shared_by || [],
      isSpecialItem: items[index].isSpecialItem,
      specialType: items[index].specialType
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