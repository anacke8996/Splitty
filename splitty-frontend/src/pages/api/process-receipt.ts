import { NextApiRequest, NextApiResponse } from 'next';
import { Mistral } from '@mistralai/mistralai';
import axios from 'axios';

// Initialize Mistral client
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

// Test client initialization
console.log('Mistral client initialized:', !!mistral);
console.log('API key configured:', !!process.env.MISTRAL_API_KEY);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

interface ProcessedItem {
  item: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
}

function parseReceiptMarkdown(markdown: string): ProcessedItem[] {
  const items: ProcessedItem[] = [];
  const lines = markdown.trim().split('\n');

  // Find table header
  let tableStart = -1;
  let headerCols: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if ((lines[i].match(/\|/g) || []).length >= 2 && 
        ['item', 'product', 'description'].some(h => lines[i].toLowerCase().includes(h))) {
      tableStart = i;
      headerCols = lines[i].split('|').map(col => col.trim().toLowerCase());
      break;
    }
  }

  if (tableStart === -1) {
    console.log("No table header found");
    return items;
  }

  // Find where the table ends
  let tableEnd = lines.length;
  for (let i = tableStart + 2; i < lines.length; i++) {
    if ((lines[i].match(/\|/g) || []).length < 2 || 
        /total|subtotal|amount due/i.test(lines[i])) {
      tableEnd = i;
      break;
    }
  }

  // Map header columns to expected fields
  const colMap: Record<string, number> = {};
  headerCols.forEach((col, idx) => {
    if (col.includes('item') || col.includes('product') || col.includes('description')) {
      colMap['item'] = idx;
    } else if (col.includes('price')) {
      colMap['price'] = idx;
    } else if (col.includes('qty') || col.includes('quantity')) {
      colMap['qty'] = idx;
    } else if (col.includes('total')) {
      colMap['total'] = idx;
    }
  });

  // Parse table rows
  for (let i = tableStart + 2; i < tableEnd; i++) {
    if ((lines[i].match(/\|/g) || []).length < 2) continue;
    
    const cols = lines[i].split('|').map(c => c.trim());
    try {
      const item = cols[colMap['item']];
      const price = parseFloat(cols[colMap['price']].replace(/[^\d.]/g, ''));
      const qty = parseInt(cols[colMap['qty']].replace(/[^\d]/g, ''));
      const total = parseFloat(cols[colMap['total']].replace(/[^\d.]/g, ''));
      
      if (item && price && qty && total) {
        items.push({ item, price, qty, total });
      }
    } catch (e) {
      continue;
    }
  }

  return items;
}

async function convertPrices(
  items: ProcessedItem[], 
  fromCurrency: string, 
  toCurrency: string
): Promise<ProcessedItem[]> {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    console.log(`Currencies are the same (${fromCurrency}), skipping conversion`);
    return items;
  }

  try {
    const response = await axios.get('https://api.freecurrencyapi.com/v1/latest', {
      params: {
        apikey: process.env.EXCHANGE_API_KEY,
        base_currency: fromCurrency.toUpperCase(),
        currencies: toCurrency.toUpperCase()
      }
    });

    if (!response.data.data) {
      console.log(`API returned error: No data in response`);
      return items;
    }

    const rate = response.data.data[toCurrency.toUpperCase()];
    if (!rate) {
      console.log(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
      return items;
    }

    console.log(`Exchange rate: 1 ${fromCurrency} = ${rate} ${toCurrency}`);

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

function detectCurrency(markdown: string): string {
  const currencySymbols: Record<string, string> = {
    '€': 'EUR',
    '$': 'USD',
    '£': 'GBP',
    '¥': 'JPY'
  };

  for (const [symbol, code] of Object.entries(currencySymbols)) {
    if (markdown.includes(symbol)) {
      console.log(`Detected currency: ${code} (symbol: ${symbol})`);
      return code;
    }
  }

  console.log("No currency symbol detected, defaulting to EUR");
  return 'EUR';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, target_currency = 'USD' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (!process.env.MISTRAL_API_KEY) {
      return res.status(500).json({ error: 'Mistral API key not configured' });
    }

    console.log('Processing receipt with Mistral OCR...');
    console.log('Image data length:', image.length);
    console.log('Target currency:', target_currency);

    // Process document with OCR
    let response;
    try {
      response = await mistral.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "image_url",
          imageUrl: `data:image/jpeg;base64,${image}`
        },
        includeImageBase64: false
      });
    } catch (ocrError) {
      console.error('Mistral OCR Error:', ocrError);
      return res.status(500).json({ 
        success: false,
        error: 'OCR processing failed',
        details: ocrError instanceof Error ? ocrError.message : 'Unknown OCR error'
      });
    }

    console.log('OCR Response received:', JSON.stringify(response, null, 2));

    if (!response.pages || response.pages.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'No pages found in OCR response'
      });
    }

    const markdown = response.pages[0].markdown;
    console.log('Extracted markdown:', markdown);
    const items = parseReceiptMarkdown(markdown);
    
    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No items could be parsed from the receipt'
      });
    }

    const sourceCurrency = detectCurrency(markdown);
    const convertedItems = await convertPrices(items, sourceCurrency, target_currency);

    return res.status(200).json({
      success: true,
      items: convertedItems,
      source_currency: sourceCurrency,
      target_currency: target_currency,
      raw_markdown: markdown
    });

  } catch (error) {
    console.error('Error processing receipt:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process receipt'
    });
  }
} 