import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import axios from 'axios';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Test client initialization
console.log('OpenAI client initialized:', !!openai);
console.log('API key configured:', !!process.env.OPENAI_API_KEY);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  currency: string;
  isSpecialItem?: boolean; // For tax, tip, service charges
  specialType?: 'tax' | 'tip' | 'service_charge' | 'discount';
}

interface ProcessReceiptResponse {
  items: ReceiptItem[];
  total: number;
  currency: string;
  language: string;
  subtotal?: number; // Pre-tax subtotal
}

interface ProcessedItem {
  item: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
  isSpecialItem?: boolean;
  specialType?: 'tax' | 'tip' | 'service_charge' | 'discount';
}

async function processReceiptWithGPT(imageBase64?: string, receiptText?: string): Promise<ProcessReceiptResponse> {
  const prompt = `Please analyze this receipt ${imageBase64 ? 'image' : 'text'} and extract the following information:

1. Extract each receipt item with:
   - English name
   - quantity (default 1 if missing)
   - price per unit in ORIGINAL currency (not total)
   - If the total price is listed (e.g. 3 items for $7.50), infer unit price as 7.50 / 3

2. Extract tax, tips, service charges, and discounts as separate line items:
   - Tax (sales tax, VAT, HST, GST, etc.)
   - Tips/gratuity (automatic gratuity, service charge, suggested tip)
   - Service charges (service fee, delivery fee, convenience fee, booking fee, processing fee, handling fee, corkage fee, cover charge)
   - Discounts (negative amounts, promotions, coupons)
   - Mark these as special items

3. Calculate subtotal (before tax and tips) and total (final amount)

4. Detect the original currency of the receipt (USD, EUR, GBP, etc.)

5. Detect the original language of the receipt

Return the information in this exact JSON format:
{
  "items": [
    {
      "name": "item name in English",
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
- Translate item names to English
- Keep prices in ORIGINAL currency - DO NOT convert currencies
- Detect currency from symbols ($, €, £, ¥, etc.) or context
- If quantity is not specified, default to 1
- Always calculate unit price, not total price for items
- Be precise with decimal places for prices
- Identify ALL types of fees and charges that should be shared by all participants:
  * Tax: VAT, sales tax, HST, GST, city tax, etc.
  * Service charges: service fee, delivery fee, convenience fee, booking fee, processing fee, handling fee, corkage fee, cover charge, facility fee, etc.
  * Tips: automatic gratuity, service charge (when it's a tip), suggested tip, mandatory gratuity
  * Discounts: promotions, coupons, member discounts (negative amounts)
- Calculate subtotal (before tax and fees) and total (final amount)
- Special items should have quantity=1 and price=total amount
- Look for keywords like: tax, VAT, HST, GST, service, delivery, convenience, booking, processing, handling, corkage, cover, facility, tip, gratuity, discount, promotion, coupon
- Common service charge variations: "Service Charge", "Svc Charge", "Service Fee", "Delivery Fee", "Convenience Fee", "Booking Fee", "Processing Fee", "Handling Fee", "Corkage Fee", "Cover Charge", "Facility Fee", "Administrative Fee", "Maintenance Fee"`;

  try {
    const messageContent = [];
    
    messageContent.push({
      type: "text",
      text: prompt
    });
    
    if (imageBase64) {
      messageContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`,
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

    // Convert messageContent to the new API format
    const inputContent = [];
    
    for (const content of messageContent) {
      if (content.type === "text") {
        inputContent.push({
          type: "input_text",
          text: content.text
        });
      } else if (content.type === "image_url") {
        inputContent.push({
          type: "input_image",
          image_url: content.image_url.url
        });
      }
    }

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: inputContent
        }
      ]
    });

    const gptResponse = response.output_text;
    
    if (!gptResponse) {
      throw new Error('No response from GPT-4o');
    }

    console.log('GPT-4o response:', gptResponse);

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

      // Validate each item
      for (const item of parsedResponse.items) {
        if (!item.name || typeof item.name !== 'string') {
          throw new Error('Invalid item structure: name must be a string');
        }
        if (typeof item.quantity !== 'number' || item.quantity < 0) {
          throw new Error('Invalid item structure: quantity must be a positive number');
        }
        if (typeof item.price !== 'number' || item.price < 0) {
          throw new Error('Invalid item structure: price must be a positive number');
        }
        if (typeof item.currency !== 'string') {
          throw new Error('Invalid item structure: currency must be a string');
        }
        if (item.isSpecialItem !== undefined && typeof item.isSpecialItem !== 'boolean') {
          throw new Error('Invalid item structure: isSpecialItem must be a boolean');
        }
        if (item.specialType !== undefined && 
            !['tax', 'tip', 'service_charge', 'discount'].includes(item.specialType)) {
          throw new Error('Invalid item structure: specialType must be one of tax, tip, service_charge, discount');
        }
      }

      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse GPT response as JSON:', parseError);
      throw new Error(`Invalid JSON response from GPT-4o: ${gptResponse}`);
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

// Keep the existing currency conversion logic for downstream use
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
    const rate = Number(rawRate.toFixed(2));

    console.log(`Exchange rate ${fromCurrency} to ${toCurrency}: ${rawRate} → rounded to ${rate}`);

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
    const { imageBase64, receiptText } = req.body;

    if (!imageBase64 && !receiptText) {
      return res.status(400).json({ error: 'No imageBase64 or receiptText provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log('Processing receipt with GPT-4o...');
    if (imageBase64) {
      console.log('Image data length:', imageBase64.length);
    }
    if (receiptText) {
      console.log('Receipt text length:', receiptText.length);
    }

    // Process receipt with GPT-4o
    const result = await processReceiptWithGPT(imageBase64, receiptText);

    console.log('Successfully processed receipt:', result);

    // Transform the items to match the frontend expected format
    const transformedItems = result.items.map(item => ({
      item: item.name,
      price: item.price,
      qty: item.quantity,
      total: item.price * item.quantity,
      isSpecialItem: item.isSpecialItem || false,
      specialType: item.specialType
    }));

    return res.status(200).json({
      success: true,
      items: transformedItems,
      total: result.total,
      currency: result.currency,
      language: result.language,
      subtotal: result.subtotal
    });

  } catch (error) {
    console.error('Error processing receipt:', error);
    
    // If it's a GPT parsing error, return the raw response for debugging
    if (error instanceof Error && error.message.includes('Invalid JSON response from GPT-4o')) {
      return res.status(500).json({ 
        success: false,
        error: 'GPT returned invalid JSON',
        raw_response: error.message.replace('Invalid JSON response from GPT-4o: ', ''),
        details: error.message
      });
    }

    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process receipt'
    });
  }
} 