import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { supabase } from '../../config/supabase';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Test client initialization
console.log('OpenAI client initialized:', !!openai);
console.log('API key configured:', !!process.env.OPENAI_API_KEY);
console.log('API key length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('API key preview:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...' || 'undefined');

// Helper function to get user from authorization header
async function getUserFromAuth(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  // Create a client with the user's session token
  const supabaseWithAuth = supabase.auth.admin || supabase;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.error('Auth error:', error);
    return null;
  }
  
  return { user, token };
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb', // Increased from default 1mb to handle compressed images
    },
  },
};

interface ReceiptItem {
  name: string;
  originalName?: string; // Original language name from receipt
  quantity: number;
  price: number;
  currency: string;
  isSpecialItem?: boolean; // For tax, tip, service charges
  specialType?: 'tax' | 'tip' | 'service_charge' | 'discount' | 'total';
}

interface ProcessReceiptResponse {
  restaurantName?: string; // Name of the restaurant/business
  items: ReceiptItem[];
  total: number;
  currency: string;
  language: string;
  subtotal?: number; // Pre-tax subtotal
  taxIncluded?: boolean; // Whether tax is already included in item prices
  taxInclusionReason?: string; // Explanation of why tax is/isn't included
}

interface ProcessedItem {
  item: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
  isSpecialItem?: boolean;
  specialType?: 'tax' | 'tip' | 'service_charge' | 'discount' | 'total';
}

// Detect if tax is included in item prices or added separately
function detectTaxIncluded(
  items: ReceiptItem[], 
  total: number, 
  subtotal?: number,
  currency?: string,
  language?: string
): { taxIncluded: boolean; reason: string } {
  
  // Validate inputs
  if (!items || !Array.isArray(items) || typeof total !== 'number') {
    return { 
      taxIncluded: false, 
      reason: 'Invalid input data for tax detection' 
    };
  }

  // Find tax items
  const taxItems = items.filter(item => 
    item && item.isSpecialItem && item.specialType === 'tax'
  );
  
  const regularItems = items.filter(item => item && !item.isSpecialItem);
  
  // Calculate totals with null checks
  const regularItemsTotal = regularItems.reduce((sum, item) => 
    sum + ((item.price || 0) * (item.quantity || 0)), 0
  );
  
  const taxTotal = taxItems.reduce((sum, item) => 
    sum + ((item.price || 0) * (item.quantity || 0)), 0
  );
  
  // Strategy 1: Mathematical check
  const tolerance = 0.5; // Allow small rounding differences
  const itemsPlusTaxTotal = regularItemsTotal + taxTotal;
  const mathDifference = Math.abs(itemsPlusTaxTotal - total);
  const regularItemsDifference = Math.abs(regularItemsTotal - total);
  
  // Handle edge case where we have no items
  if (regularItems.length === 0) {
    return { 
      taxIncluded: false, 
      reason: 'No regular items found to analyze tax inclusion' 
    };
  }
  
  console.log(`Tax detection analysis:
    Regular items total: ${regularItemsTotal}
    Tax total: ${taxTotal}
    Items + tax: ${itemsPlusTaxTotal}
    Receipt total: ${total}
    Difference (items + tax): ${mathDifference}
    Difference (items only): ${regularItemsDifference}`);
  
  // Strategy 2: VAT keyword detection (indicates included tax)
  const includedTaxKeywords = [
    'iva', 'igic', 'tva', 'btw', 'mva', 'vat included', 'tax included',
    'inclui iva', 'incluye iva', 'tva incluse', 'iva incluido',
    'steuer enthalten', 'mwst enthalten'
  ];
  
  const separateTaxKeywords = [
    'sales tax', 'tax added', 'plus tax', 'excluding tax',
    'tax not included', 'antes de impuestos'
  ];
  
  const allText = items
    .filter(item => item && item.name)
    .map(item => item.name.toLowerCase())
    .join(' ') + ' ' + (language || '').toLowerCase();
  
  const hasIncludedKeywords = includedTaxKeywords.some(keyword => 
    allText.includes(keyword)
  );
  
  const hasSeparateKeywords = separateTaxKeywords.some(keyword => 
    allText.includes(keyword)
  );
  
  // Strategy 3: Currency/region hints
  const includedTaxCurrencies = ['EUR', 'GBP']; // European currencies typically include VAT
  const separateTaxCurrencies = ['USD', 'CAD']; // North American currencies typically separate tax
  
  const currencyHint = currency ? (
    includedTaxCurrencies.includes(currency) ? 'included' :
    separateTaxCurrencies.includes(currency) ? 'separate' : 'neutral'
  ) : 'neutral';
  
  // Decision logic with priority
  
  // Strong evidence for separate tax (US style)
  if (hasSeparateKeywords) {
    return { 
      taxIncluded: false, 
      reason: 'Receipt contains keywords indicating tax is added separately' 
    };
  }
  
  // Strong evidence for included tax (European style)
  if (hasIncludedKeywords) {
    return { 
      taxIncluded: true, 
      reason: 'Receipt contains VAT keywords indicating tax is included in prices' 
    };
  }
  
  // Mathematical evidence for separate tax
  if (mathDifference <= tolerance && taxTotal > 0) {
    console.log(`✅ Tax detected as SEPARATE (American style): items + tax = total`);
    return { 
      taxIncluded: false, 
      reason: `Mathematical check: items (${regularItemsTotal}) + tax (${taxTotal}) = total (${total})` 
    };
  }
  
  // Mathematical evidence for included tax
  if (regularItemsDifference <= tolerance && taxTotal > 0) {
    console.log(`✅ Tax detected as INCLUDED (European style): items ≈ total`);
    return { 
      taxIncluded: true, 
      reason: `Mathematical check: items total (${regularItemsTotal}) ≈ receipt total (${total}), tax already included` 
    };
  }
  
  // Fallback to currency hints
  if (currencyHint === 'included') {
    return { 
      taxIncluded: true, 
      reason: `Currency ${currency} suggests European-style included VAT` 
    };
  }
  
  if (currencyHint === 'separate') {
    return { 
      taxIncluded: false, 
      reason: `Currency ${currency} suggests North American-style separate tax` 
    };
  }
  
  // Default fallback
  return { 
    taxIncluded: false, 
    reason: 'Unable to determine tax style, defaulting to separate tax for safety' 
  };
}

// Helper to deduplicate and merge items with the same name/currency
function deduplicateAndMergeItems(items: ReceiptItem[]): ReceiptItem[] {
  const merged: Record<string, ReceiptItem> = {};
  for (const item of items) {
    // Only deduplicate regular items (not special items)
    if (!item.name || item.isSpecialItem) {
      const key = `${item.name}|${item.currency}|special|${item.specialType || ''}`;
      if (!merged[key]) {
        merged[key] = { ...item };
      } else {
        // For special items, just sum the price if duplicate
        merged[key].price += item.price;
      }
      continue;
    }
    const key = `${item.name.trim().toLowerCase()}|${item.currency}`;
    if (!merged[key]) {
      merged[key] = { ...item };
    } else {
      // If quantities and prices match a pattern like (qty=1, price=total) and (qty>1, price=unit), merge
      const a = merged[key];
      const b = item;
      // Check if one is a total and the other is a unit price
      if (
        (a.quantity === 1 && b.quantity > 1 && Math.abs(a.price - b.price * b.quantity) < 0.01) ||
        (b.quantity === 1 && a.quantity > 1 && Math.abs(b.price - a.price * a.quantity) < 0.01)
      ) {
        // Keep the one with higher quantity and correct unit price
        if (a.quantity > b.quantity) {
          // a is the correct one, skip b
          continue;
        } else {
          // b is the correct one, replace a
          merged[key] = { ...b };
        }
      } else if (a.price === b.price) {
        // If unit prices match, sum quantities
        merged[key].quantity += b.quantity;
      } else {
        // Otherwise, keep both as separate lines (rare case)
        const altKey = `${item.name.trim().toLowerCase()}|${item.currency}|${Math.random()}`;
        merged[altKey] = { ...b };
      }
    }
  }
  return Object.values(merged);
}

async function processReceiptWithGPT(imageBase64?: string, receiptText?: string): Promise<ProcessReceiptResponse> {
  const prompt = `Please analyze this receipt ${imageBase64 ? 'image' : 'text'} and extract the following information:

1. Extract the restaurant/business name from the receipt header

2. Extract each receipt item with:
   - Original name (exactly as written on receipt)
   - English name (translate if needed, or same as original if already in English)
   - quantity (BE VERY CAREFUL with quantity detection)
   - price per unit in ORIGINAL currency (not total)
   - If the total price is listed (e.g. 3 items for $7.50), infer unit price as 7.50 / 3

QUANTITY DETECTION RULES:
- For RETAIL receipts (grocery stores, warehouses like Costco): quantity is usually 1 unless explicitly stated
- Look for patterns like "2 @ $5.00" or "QTY: 3" or "3x item"
- Do NOT use product codes, item numbers, or SKUs as quantities
- Do NOT use prices as quantities
- If uncertain about quantity, default to 1
- For multi-packs (like "24-pack water"), the quantity is still 1 (you bought 1 pack)
- Quantities should typically be small numbers (1-10), rarely above 20

3. Extract tax, tips, service charges, and discounts as separate line items:
   - Tax (sales tax, VAT, HST, GST, etc.)
   - Tips/gratuity (automatic gratuity, service charge, suggested tip)
   - Service charges (service fee, delivery fee, convenience fee, booking fee, processing fee, handling fee, corkage fee, cover charge)
   - Discounts (negative amounts, promotions, coupons)
   - Mark these as special items

4. Calculate subtotal (before tax and tips) and total (final amount)

5. Detect the original currency of the receipt (USD, EUR, GBP, etc.)

6. Detect the original language of the receipt

Return the information in this exact JSON format:
{
  "restaurantName": "Restaurant/Business Name",
  "items": [
    {
      "name": "item name in English",
      "originalName": "original item name as written on receipt",
      "quantity": 1,
      "price": 0.00,
      "currency": "USD",
      "isSpecialItem": false
    },
    {
      "name": "Tax",
      "quantity": 1,
      "price": 2.50,
      "currency": "USD",
      "isSpecialItem": true,
      "specialType": "tax"
    },
    {
      "name": "Service Charge",
      "quantity": 1,
      "price": 5.00,
      "currency": "USD",
      "isSpecialItem": true,
      "specialType": "service_charge"
    },
    {
      "name": "Tip",
      "quantity": 1,
      "price": 3.00,
      "currency": "USD",
      "isSpecialItem": true,
      "specialType": "tip"
    }
  ],
  "subtotal": 15.00,
  "total": 25.50,
  "currency": "USD",
  "language": "detected language"
}

Important:
- Return ONLY valid JSON, no additional text
- Provide both original and English names for all items
- For special items (tax, tip, etc.), use English names for both fields unless they appear in another language on the receipt
- Keep prices in ORIGINAL currency - DO NOT convert currencies
- Detect currency from symbols ($, €, £, ¥, etc.) or context
- If quantity is not specified, default to 1
- Always calculate unit price, not total price for items
- Be precise with decimal places for prices
- DO NOT extract total/subtotal lines as items (e.g., "Total", "Subtotal", "Total Service", "Grand Total", "Final Total", etc.)
- Only extract actual purchased items, taxes, tips, and legitimate service charges
- Summary lines showing final amounts should not be included as items

CRITICAL QUANTITY EXAMPLES:
- "24-pack water bottles" → quantity: 1 (you bought 1 pack, not 24 bottles)
- "SWATER 40oz bottle" → quantity: 1 (40oz is the size, not quantity)
- "KS TOWEL Set" → quantity: 1 (it's 1 set)
- "2 @ $5.99 Apples" → quantity: 2, price: 5.99 (2 units at $5.99 each)
- Item codes like "512599", "490278" are NOT quantities

CRITICAL: Distinguish between legitimate services and service charges:
- LEGITIMATE SERVICES (mark as regular items, isSpecialItem=false):
  * Room service, cleaning service, laundry service, concierge service, valet service
  * Servicio de limpieza, servicio de habitación, servicio de lavandería
  * Massage, spa service, tour service, shuttle service, car service
  * Any service that is a product/amenity being sold
- SERVICE CHARGES/FEES (mark as special items, isSpecialItem=true, specialType="service_charge"):
  * Service charge, service fee, svc charge, svc fee
  * Delivery fee, convenience fee, booking fee, processing fee, handling fee
  * Corkage fee, cover charge, facility fee, administrative fee, maintenance fee
  * Automatic gratuity (when labeled as service charge)

Tax identification:
- Tax: VAT, sales tax, HST, GST, city tax, impuesto, taxe, steuer
- Look for: "tax", "VAT", "HST", "GST", "IVA", "impuesto", "taxe", "steuer"

Service charge identification (be very specific):
- Only mark as service_charge if it's clearly an additional FEE or CHARGE
- Look for: "service charge", "service fee", "svc charge", "svc fee", "cargo por servicio", "frais de service"
- NOT legitimate services like "room service", "cleaning service", etc.

Tips identification:
- Automatic gratuity, suggested tip, mandatory gratuity, propina, pourboire, trinkgeld
- Look for: "tip", "gratuity", "propina", "pourboire", "trinkgeld"

Discounts identification:
- Promotions, coupons, member discounts, descuento, remise, rabatt (negative amounts)
- Look for: "discount", "promotion", "coupon", "descuento", "remise", "rabatt"

Calculate subtotal (before tax and fees) and total (final amount)
Special items should have quantity=1 and price=total amount`;

  try {
    const messageContent = [];
    
    messageContent.push({
      type: "text",
      text: prompt
    });
    
    if (imageBase64) {
      const dataUrl = `data:image/jpeg;base64,${imageBase64}`;
      console.log('Sending to OpenAI - Data URL preview (first 200 chars):', dataUrl.substring(0, 200));
      console.log('Sending to OpenAI - Data URL preview (last 100 chars):', dataUrl.substring(dataUrl.length - 100));
      
      messageContent.push({
        type: "image_url",
        image_url: {
          url: dataUrl,
          detail: "high"
        }
      });
    }
    
    if (receiptText) {
      messageContent.push({
        type: "text",
        text: `Receipt text: ${receiptText}`
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: messageContent as any
        }
      ],
      max_tokens: 4000,
      temperature: 0.1
    });

    const gptResponse = response.choices[0]?.message?.content;
    
    if (!gptResponse) {
      throw new Error('No response from GPT-4.1-mini-2025-04-14');
    }

    console.log('GPT-4.1-mini-2025-04-14 response:', gptResponse);

    // Try to parse the JSON response
    try {
      // Clean up the response by removing markdown code blocks if present
      let cleanResponse = gptResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const parsedResponse = JSON.parse(cleanResponse);
      
      // Validate the response structure
      if (!parsedResponse.items || !Array.isArray(parsedResponse.items)) {
        throw new Error('Invalid response structure: items array missing');
      }
      
      if (typeof parsedResponse.total !== 'number') {
        throw new Error('Invalid response structure: total must be a number');
      }
      
      if (typeof parsedResponse.currency !== 'string') {
        throw new Error('Invalid response structure: currency must be a string');
      }
      
      if (typeof parsedResponse.language !== 'string') {
        throw new Error('Invalid response structure: language must be a string');
      }

      // Validate and fix each item
      for (const item of parsedResponse.items) {
        if (!item.name || typeof item.name !== 'string') {
          throw new Error('Invalid item structure: name must be a string');
        }
        if (typeof item.quantity !== 'number' || item.quantity < 0) {
          throw new Error('Invalid item structure: quantity must be a positive number');
        }
        
        // Quantity validation and auto-correction
        if (!item.isSpecialItem && item.quantity > 50) {
          console.warn(`⚠️ Suspicious quantity detected for "${item.name}": ${item.quantity}. Auto-correcting to 1.`);
          console.warn(`   This might be a product code or SKU misread as quantity.`);
          item.quantity = 1;
        }
        
        // For special items, quantity should always be 1
        if (item.isSpecialItem && item.quantity !== 1) {
          console.warn(`⚠️ Special item "${item.name}" had quantity ${item.quantity}. Auto-correcting to 1.`);
          item.quantity = 1;
        }
        
        if (typeof item.price !== 'number' || (item.price < 0 && item.specialType !== 'discount')) {
          throw new Error('Invalid item structure: price must be a positive number unless it is a discount');
        }
        if (typeof item.currency !== 'string') {
          throw new Error('Invalid item structure: currency must be a string');
        }
        if (item.isSpecialItem !== undefined && typeof item.isSpecialItem !== 'boolean') {
          throw new Error('Invalid item structure: isSpecialItem must be a boolean');
        }
        if (item.specialType !== undefined && 
            !['tax', 'tip', 'service_charge', 'discount', 'total'].includes(item.specialType)) {
          throw new Error('Invalid item structure: specialType must be one of tax, tip, service_charge, discount, total');
        }
      }

      // Deduplicate and merge items before further processing
      parsedResponse.items = deduplicateAndMergeItems(parsedResponse.items);

      // Detect tax inclusion style
      const taxDetection = detectTaxIncluded(
        parsedResponse.items || [],
        parsedResponse.total || 0,
        parsedResponse.subtotal,
        parsedResponse.currency || '',
        parsedResponse.language || ''
      );
      
      console.log(`🏷️ Tax detection result: ${taxDetection.taxIncluded ? 'INCLUDED' : 'SEPARATE'}`);
      console.log(`📝 Reason: ${taxDetection.reason}`);
      
      return {
        ...parsedResponse,
        taxIncluded: taxDetection.taxIncluded,
        taxInclusionReason: taxDetection.reason
      };
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON:', parseError);
      throw new Error(`Invalid JSON response from GPT-4.1-mini-2025-04-14: ${gptResponse}`);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
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
    const { imageBase64, receiptText } = req.body;

    if (!imageBase64 && !receiptText) {
      return res.status(400).json({ error: 'No imageBase64 or receiptText provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured');
      console.error('Environment variables available:', Object.keys(process.env).filter(key => key.includes('OPENAI')));
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log('Processing receipt with GPT-4.1-mini-2025-04-14...');
    if (imageBase64) {
      const imageSizeMB = (imageBase64.length * 0.75 / 1024 / 1024).toFixed(2); // Approximate size conversion
      console.log('Image data length:', imageBase64.length, `(~${imageSizeMB}MB)`);
      console.log('Image format: JPEG (auto-compressed)');
      console.log('Base64 data preview (first 100 chars):', imageBase64.substring(0, 100));
      console.log('Base64 data preview (last 100 chars):', imageBase64.substring(imageBase64.length - 100));
    }
    if (receiptText) {
      console.log('Receipt text length:', receiptText.length);
    }

    // Process receipt with GPT-4.1-mini-2025-04-14
    const result = await processReceiptWithGPT(imageBase64, receiptText);

    console.log('Successfully processed receipt:', result);

    // Transform the items to match the frontend expected format
    // Filter out total/subtotal items and items with zero cost
    const transformedItems = result.items
      .filter(item => {
        // Remove total/subtotal summary lines
        if (item.isSpecialItem && item.specialType === 'total') {
          return false;
        }
        // Remove items with zero or negative cost (except special items like tax)
        if (!item.isSpecialItem && (item.price <= 0 || (item.price * item.quantity) <= 0)) {
          console.log(`🗑️ Filtering out zero-cost item: "${item.name}" (price: ${item.price}, qty: ${item.quantity})`);
          return false;
        }
        return true;
      })
      .map(item => ({
        item: item.name,
        originalItem: item.originalName,
        price: Math.abs(item.price),
        qty: item.quantity,
        total: Math.abs(item.price) * item.quantity,
        isSpecialItem: item.isSpecialItem || false,
        specialType: item.specialType
      }));

    // Prepare response data
    const responseData = {
      success: true,
      restaurantName: result.restaurantName,
      items: transformedItems,
      total: result.total,
      currency: result.currency,
      language: result.language,
      subtotal: result.subtotal,
      taxIncluded: result.taxIncluded,
      taxInclusionReason: result.taxInclusionReason
    };

    // Note: Receipts are now only saved when the user completes the entire flow
    // This prevents saving incomplete receipts to the database

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Error processing receipt:', error);
    
    // If it's a GPT parsing error, return the raw response for debugging
    if (error instanceof Error && error.message.includes('Invalid JSON response from GPT-4.1-mini-2025-04-14')) {
      return res.status(500).json({ 
        success: false,
        error: 'GPT returned invalid JSON',
        raw_response: error.message.replace('Invalid JSON response from GPT-4.1-mini-2025-04-14: ', ''),
        details: error.message
      });
    }

    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process receipt'
    });
  }
} 