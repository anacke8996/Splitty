import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../config/supabase'

// Helper function to get user from authorization header
async function getUserFromAuth(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.error('Auth error:', error);
    return null;
  }
  
  return { user, token };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get authenticated user
    const authResult = await getUserFromAuth(req);
    if (!authResult) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { user, token } = authResult;
    const { receiptId } = req.body;

    if (!receiptId) {
      return res.status(400).json({ error: 'receiptId is required' });
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

    console.log(`Attempting to delete receipt ${receiptId} for user ${user.id}`);

    // First, verify the receipt belongs to the user and get its details
    const { data: receiptData, error: fetchError } = await authenticatedSupabase
      .from('receipts')
      .select('id, restaurant_name, starred')
      .eq('id', receiptId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !receiptData) {
      console.error('Receipt not found or access denied:', fetchError);
      return res.status(404).json({ 
        success: false, 
        error: 'Receipt not found or access denied' 
      });
    }

    // Delete the receipt
    const { error: deleteError } = await authenticatedSupabase
      .from('receipts')
      .delete()
      .eq('id', receiptId)
      .eq('user_id', user.id); // Double-check ownership

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete receipt',
        details: deleteError.message
      });
    }

    console.log(`Successfully deleted receipt ${receiptId} (${receiptData.restaurant_name}) for user ${user.id}`);

    res.status(200).json({ 
      success: true, 
      message: 'Receipt deleted successfully',
      deletedReceipt: {
        id: receiptData.id,
        restaurant_name: receiptData.restaurant_name,
        starred: receiptData.starred
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Unexpected error occurred' 
    });
  }
} 