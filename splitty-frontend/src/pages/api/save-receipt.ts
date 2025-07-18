import type { NextApiRequest, NextApiResponse } from 'next'

async function getUserFromAuth(req: NextApiRequest) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Create Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify the token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth error:', error);
      return null;
    }

    return { user, token };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

interface SaveReceiptRequest {
  restaurantName: string;
  totalAmount: number;
  currency: string;
  items: Array<{
    item: string;
    originalItem?: string;
    price: number;
    qty: number;
    total: number;
    converted_price?: number;
    converted_total?: number;
    shared_by?: string[];
    isSpecialItem?: boolean;
    specialType?: 'tax' | 'tip' | 'service_charge' | 'discount' | 'total';
    shareEqually?: boolean;
  }>;
  participants: string[];
  userTotals: Record<string, number>;
  sourceCurrency?: string;
  targetCurrency?: string;
  detectedLanguage?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authenticated user
    const authResult = await getUserFromAuth(req);
    if (!authResult) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { user, token } = authResult;
    const receiptData: SaveReceiptRequest = req.body;

    // Validate required fields
    if (!receiptData.restaurantName || !receiptData.items || !receiptData.participants) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create authenticated Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Convert items to database format
    const dbItems = receiptData.items.map(item => ({
      name: item.item,
      originalName: item.originalItem || item.item,
      price: item.converted_price || item.price,
      quantity: item.qty,
      total: item.converted_total || item.total,
      assignedTo: item.shared_by || [],
      type: item.isSpecialItem ? 'discrete' : 'regular' as 'regular' | 'shared' | 'discrete',
      isSpecialItem: item.isSpecialItem || false,
      specialType: item.specialType,
      shareEqually: item.shareEqually || false
    }));

    // Create split results for each participant
    const splitResults = Object.entries(receiptData.userTotals).map(([participant, total]) => ({
      participant,
      total,
      currency: receiptData.targetCurrency || receiptData.currency
    }));

    // Save the completed receipt to database
    const { data, error } = await authenticatedSupabase
      .from('receipts')
      .insert({
        user_id: user.id,
        restaurant_name: receiptData.restaurantName,
        total_amount: receiptData.totalAmount,
        currency: receiptData.targetCurrency || receiptData.currency,
        source_currency: receiptData.sourceCurrency,
        receipt_items: dbItems,
        participants: receiptData.participants,
        split_results: splitResults,
        detected_language: receiptData.detectedLanguage,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database save error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to save receipt to database',
        details: error.message
      });
    }

    console.log('Receipt saved to database successfully:', data.id);

    return res.status(200).json({ 
      success: true, 
      receiptId: data.id,
      message: 'Receipt saved successfully'
    });

  } catch (error) {
    console.error('Error saving receipt:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save receipt'
    });
  }
} 