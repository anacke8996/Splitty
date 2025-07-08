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
  price_eur: number;
}

interface ProcessReceiptResponse {
  items: ReceiptItem[];
  total_eur: number;
  language: string;
}

interface ProcessedItem {
  item: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
}

async function processReceiptWithGPT(imageBase64?: string, receiptText?: string): Promise<ProcessReceiptResponse> {
  const prompt = `Please analyze this receipt ${imageBase64 ? 'image' : 'text'} and extract the following information:

1. Extract each receipt item with:
   - English name
   - quantity (default 1 if missing)
   - price per unit in EUR (not total)
   - If the total price is listed (e.g. 3 items for €7.50), infer unit price as 7.50 / 3

2. Calculate the total amount in EUR

3. Detect the original language of the receipt

Return the information in this exact JSON format:
{
  "items": [
    {
      "name": "item name in English",
      "quantity": 1,
      "price_eur": 0.00
    }
  ],
  "total_eur": 0.00,
  "language": "detected language"
}

Important:
- Return ONLY valid JSON, no additional text
- Translate item names to English
- Convert prices to EUR if they're in a different currency
- Use reasonable exchange rates for currency conversion
- If quantity is not specified, default to 1
- Always calculate unit price, not total price for items
- Be precise with decimal places for prices`;

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
      
      if (typeof parsedResponse.total_eur !== 'number') {
        throw new Error('Invalid response structure: total_eur must be a number');
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
        if (typeof item.price_eur !== 'number' || item.price_eur < 0) {
          throw new Error('Invalid item structure: price_eur must be a positive number');
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

    return res.status(200).json({
      success: true,
      ...result
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