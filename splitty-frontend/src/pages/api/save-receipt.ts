import type { NextApiRequest, NextApiResponse } from 'next'

async function getUserFromAuth(req: NextApiRequest) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    
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

    console.log('Save-receipt: Authenticated user:', user.id, user.email);
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

    // Validate that there's at least one participant
    if (receiptData.participants.length === 0) {
      return res.status(400).json({ error: 'At least one participant is required' });
    }

    // Validate that userTotals has entries for all participants
    if (!receiptData.userTotals || Object.keys(receiptData.userTotals).length === 0) {
      return res.status(400).json({ error: 'User totals are required' });
    }

    // Validate that all participants have totals
    const missingParticipants = receiptData.participants.filter(
      participant => !(participant in receiptData.userTotals)
    );
    if (missingParticipants.length > 0) {
      return res.status(400).json({ 
        error: `Missing totals for participants: ${missingParticipants.join(', ')}` 
      });
    }

    // Create authenticated Supabase client (same pattern as receipts.ts)
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
    // Match exact database schema from Supabase
    const receiptToSave = {
      user_id: user.id,                                                    // uuid, nullable
      restaurant_name: receiptData.restaurantName,                         // text, not null
      total_amount: receiptData.totalAmount,                               // numeric, not null
      currency: receiptData.targetCurrency || receiptData.currency,        // text, not null
      receipt_items: dbItems,                                              // jsonb, not null
      participants: receiptData.participants,                              // ARRAY, not null
      split_results: splitResults                                          // jsonb, not null
      // Note: id and created_at will be automatically set by the database
      // Removed: source_currency, detected_language, completed_at (don't exist in schema)
    };
    
    console.log('Save-receipt: Attempting to save receipt for user:', user.id);
    console.log('Save-receipt: Receipt data:', {
      restaurant: receiptToSave.restaurant_name,
      total: receiptToSave.total_amount,
      currency: receiptToSave.currency,
      user_id: receiptToSave.user_id
    });
    console.log('Save-receipt: All columns being inserted:', Object.keys(receiptToSave));

    const { data, error } = await authenticatedSupabase
      .from('receipts')
      .insert(receiptToSave)
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

    console.log('Receipt saved to database successfully:', data.id, 'at', data.created_at);

    // Trigger cleanup asynchronously (don't wait for it)
    setTimeout(async () => {
      try {
        console.log('Triggering cleanup after receipt save...');
        
        // Quick check if cleanup is needed
        const { data: countData } = await authenticatedSupabase
          .from('receipts')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);
        
        if (countData && countData.length > 15) {
          // Call cleanup endpoint internally
          const cleanup = await import('./cleanup-receipts');
          await cleanup.default(
            { 
              method: 'POST', 
              headers: { authorization: `Bearer ${token}` },
              body: {}
            } as any,
            {
              status: () => ({ json: () => {} }),
              json: () => {}
            } as any
          );
        }
      } catch (error) {
        console.error('Error during post-save cleanup:', error);
      }
    }, 2000); // 2 second delay to not affect save response time

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