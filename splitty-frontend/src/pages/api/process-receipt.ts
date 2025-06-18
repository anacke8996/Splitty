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

  console.log('Parsing markdown with', lines.length, 'lines');

  // Try multiple parsing strategies
  const strategies = [
    () => parseTableFormat(lines),
    () => parseListFormat(lines),
    () => parseSpanishReceiptFormat(lines),
    () => parseFreeformFormat(lines)
  ];

  for (const strategy of strategies) {
    try {
      const result = strategy();
      if (result.length > 0) {
        console.log(`Successfully parsed ${result.length} items using strategy`);
        return result;
      }
    } catch (error) {
      console.log('Strategy failed:', error);
      continue;
    }
  }

  console.log('All parsing strategies failed');
  return items;
}

// Strategy 1: Parse markdown table format (original logic)
function parseTableFormat(lines: string[]): ProcessedItem[] {
  const items: ProcessedItem[] = [];
  
  // Find table header
  let tableStart = -1;
  let headerCols: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if ((lines[i].match(/\|/g) || []).length >= 2) {
      const lowerLine = lines[i].toLowerCase();
      if (['item', 'product', 'description', 'descripcion', 'desc'].some(h => lowerLine.includes(h))) {
        tableStart = i;
        headerCols = lines[i].split('|').map(col => col.trim().toLowerCase());
        break;
      }
    }
  }

  if (tableStart === -1) return items;

  // Find where the table ends
  let tableEnd = lines.length;
  for (let i = tableStart + 2; i < lines.length; i++) {
    if ((lines[i].match(/\|/g) || []).length < 2 || 
        /total|subtotal|amount due|suma|importe total/i.test(lines[i])) {
      tableEnd = i;
      break;
    }
  }

  // Enhanced column mapping for multiple languages
  const colMap: Record<string, number> = {};
  headerCols.forEach((col, idx) => {
    // Item/Description columns
    if (['item', 'product', 'description', 'descripcion', 'desc', 'art', 'articulo'].some(h => col.includes(h))) {
      colMap['item'] = idx;
    }
    // Price columns
    else if (['price', 'precio', 'pu', 'unit', 'unitario'].some(h => col.includes(h))) {
      colMap['price'] = idx;
    }
    // Quantity columns
    else if (['qty', 'quantity', 'cantidad', 'ct', 'un', 'cant'].some(h => col.includes(h))) {
      colMap['qty'] = idx;
    }
    // Total columns
    else if (['total', 'importe', 'imp', 'amount'].some(h => col.includes(h))) {
      colMap['total'] = idx;
    }
  });

  // Parse table rows
  for (let i = tableStart + 2; i < tableEnd; i++) {
    if ((lines[i].match(/\|/g) || []).length < 2) continue;
    
    const cols = lines[i].split('|').map(c => c.trim());
    try {
      const item = cols[colMap['item']] || 'Unknown Item';
      const priceStr = cols[colMap['price']] || '0';
      const qtyStr = cols[colMap['qty']] || '1';
      const totalStr = cols[colMap['total']] || cols[colMap['price']] || '0';
      
      const price = parsePrice(priceStr);
      const qty = parseQuantity(qtyStr);
      const total = parsePrice(totalStr);
      
      if (item && (price > 0 || total > 0)) {
        items.push({ 
          item, 
          price: price || total / (qty || 1), 
          qty: qty || 1, 
          total: total || price * (qty || 1)
        });
      }
    } catch (e) {
      continue;
    }
  }

  return items;
}

// Strategy 2: Parse list format (no tables, just lines)
function parseListFormat(lines: string[]): ProcessedItem[] {
  const items: ProcessedItem[] = [];
  
  for (const line of lines) {
    // Skip obviously non-item lines
    if (line.length < 3 || /^(total|subtotal|tax|iva|fecha|date|ticket|mesa|table)/i.test(line)) {
      continue;
    }
    
    // Look for patterns like: "3 Pan 2,50 7,50" or "1 zamburiñas 19,00 19,00"
    const patterns = [
      /^(\d+)\s+(.+?)\s+(\d+[,.]?\d*)\s+(\d+[,.]?\d*)$/,
      /^(.+?)\s+(\d+[,.]?\d*)\s+(\d+[,.]?\d*)$/,
      /^(\d+)\s+(.+?)\s+(\d+[,.]?\d*)$/
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let qty, item, price, total;
        
        if (match.length === 5) {
          // Format: qty item price total
          [, qty, item, price, total] = match;
        } else if (match.length === 4) {
          // Format: item price total
          [, item, price, total] = match;
          qty = '1';
        } else if (match.length === 4) {
          // Format: qty item price
          [, qty, item, price] = match;
          total = price;
        }
        
        const parsedQty = parseQuantity(qty || '1');
        const parsedPrice = parsePrice(price || '0');
        const parsedTotal = parsePrice(total || price || '0');
        
        if (item && (parsedPrice > 0 || parsedTotal > 0)) {
          items.push({
            item: item.trim(),
            price: parsedPrice || parsedTotal / parsedQty,
            qty: parsedQty,
            total: parsedTotal || parsedPrice * parsedQty
          });
          break;
        }
      }
    }
  }
  
  return items;
}

// Strategy 3: Parse Spanish receipt format specifically
function parseSpanishReceiptFormat(lines: string[]): ProcessedItem[] {
  const items: ProcessedItem[] = [];
  
  for (const line of lines) {
    // Skip header and footer lines
    if (/^(bodega|bar|casa|fecha|ticket|total|gracias|cif|dni)/i.test(line) || 
        line.length < 5) {
      continue;
    }
    
    // Spanish receipts often have format: "qty description price total"
    // Examples: "3 Pan 2,50 7,50", "1 zamburiñas 19,00 19,00"
    const spanishPattern = /^(\d+)\s+(.+?)\s+(\d+[,.]?\d*)\s+(\d+[,.]?\d*)$/;
    const match = line.match(spanishPattern);
    
    if (match) {
      const [, qtyStr, description, priceStr, totalStr] = match;
      
      const qty = parseQuantity(qtyStr);
      const price = parsePrice(priceStr);
      const total = parsePrice(totalStr);
      
      if (description && (price > 0 || total > 0)) {
        items.push({
          item: description.trim(),
          price: price || total / qty,
          qty: qty,
          total: total || price * qty
        });
      }
    }
  }
  
  return items;
}

// Strategy 4: Parse freeform format (fallback)
function parseFreeformFormat(lines: string[]): ProcessedItem[] {
  const items: ProcessedItem[] = [];
  
  for (const line of lines) {
    // Look for any line that contains both text and numbers
    const pricePattern = /(\d+[,.]?\d*)\s*[€$£¥]?/g;
    const prices = Array.from(line.matchAll(pricePattern));
    
    if (prices.length >= 1 && line.length > 5) {
      // Extract item name by removing price patterns
      let itemName = line;
      prices.forEach(match => {
        itemName = itemName.replace(match[0], '').trim();
      });
      
      // Clean up item name
      itemName = itemName.replace(/^\d+\s*/, '').trim(); // Remove leading numbers
      itemName = itemName.replace(/[|]/g, '').trim(); // Remove table separators
      
      if (itemName.length > 2 && prices.length > 0) {
        const price = parsePrice(prices[0][1]);
        const total = prices.length > 1 ? parsePrice(prices[prices.length - 1][1]) : price;
        const qty = 1;
        
        if (price > 0) {
          items.push({
            item: itemName,
            price: price,
            qty: qty,
            total: total
          });
        }
      }
    }
  }
  
  return items;
}

// Helper function to parse prices with different decimal separators
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  
  // Remove currency symbols and spaces
  const cleaned = priceStr.replace(/[€$£¥\s]/g, '');
  
  // Handle European decimal format (comma as decimal separator)
  const normalized = cleaned.replace(',', '.');
  
  // Extract numbers
  const match = normalized.match(/\d+\.?\d*/);
  return match ? parseFloat(match[0]) : 0;
}

// Helper function to parse quantities
function parseQuantity(qtyStr: string): number {
  if (!qtyStr) return 1;
  
  const cleaned = qtyStr.replace(/[^\d]/g, '');
  const qty = parseInt(cleaned);
  return qty > 0 ? qty : 1;
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
    '¥': 'JPY',
    '₹': 'INR',
    '₽': 'RUB',
    '¢': 'USD', // cents
    '₩': 'KRW'
  };

  const currencyWords: Record<string, string> = {
    'eur': 'EUR',
    'euro': 'EUR',
    'euros': 'EUR',
    'usd': 'USD',
    'dollar': 'USD',
    'dollars': 'USD',
    'gbp': 'GBP',
    'pound': 'GBP',
    'pounds': 'GBP',
    'jpy': 'JPY',
    'yen': 'JPY',
    'peseta': 'EUR', // Legacy Spanish currency, now EUR
    'pesetas': 'EUR'
  };

  // First check for currency symbols
  for (const [symbol, code] of Object.entries(currencySymbols)) {
    if (markdown.includes(symbol)) {
      console.log(`Detected currency: ${code} (symbol: ${symbol})`);
      return code;
    }
  }

  // Then check for currency words
  const lowerMarkdown = markdown.toLowerCase();
  for (const [word, code] of Object.entries(currencyWords)) {
    if (lowerMarkdown.includes(word)) {
      console.log(`Detected currency: ${code} (word: ${word})`);
      return code;
    }
  }

  // Check for country-specific patterns
  if (/spain|españa|madrid|barcelona|valencia/i.test(markdown)) {
    console.log("Detected Spanish location, defaulting to EUR");
    return 'EUR';
  }
  
  if (/france|paris|lyon|marseille/i.test(markdown)) {
    console.log("Detected French location, defaulting to EUR");
    return 'EUR';
  }
  
  if (/italy|italia|rome|milan|venice/i.test(markdown)) {
    console.log("Detected Italian location, defaulting to EUR");
    return 'EUR';
  }

  if (/germany|deutschland|berlin|munich/i.test(markdown)) {
    console.log("Detected German location, defaulting to EUR");
    return 'EUR';
  }

  // Check for decimal patterns (European vs American)
  const europeanDecimalPattern = /\d+,\d{2}(?:\s*€)?/;
  const americanDecimalPattern = /\$?\d+\.\d{2}/;
  
  if (europeanDecimalPattern.test(markdown) && !americanDecimalPattern.test(markdown)) {
    console.log("Detected European decimal format, defaulting to EUR");
    return 'EUR';
  }

  console.log("No currency detected, defaulting to EUR");
  return 'EUR';
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
    
    // Log detailed information about what we received
    console.log('Response structure:');
    console.log('- Pages count:', response.pages?.length);
    if (response.pages && response.pages[0]) {
      const page = response.pages[0];
      console.log('- Page 0 keys:', Object.keys(page));
      console.log('- Has markdown:', !!page.markdown);
      console.log('- Markdown length:', page.markdown?.length);
      
      // Check for other potential data fields
      if (page.text) console.log('- Has text field:', page.text.length);
      if (page.tables) console.log('- Has tables field:', page.tables.length);
      if (page.lines) console.log('- Has lines field:', page.lines.length);
      if (page.words) console.log('- Has words field:', page.words.length);
      if (page.blocks) console.log('- Has blocks field:', page.blocks.length);
    }

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