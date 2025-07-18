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
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get authenticated user
    const authResult = await getUserFromAuth(req);
    if (!authResult) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { user, token } = authResult;
    const { receiptId, starred } = req.body;

    if (!receiptId || typeof starred !== 'boolean') {
      return res.status(400).json({ error: 'receiptId and starred (boolean) are required' });
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

    console.log(`Attempting to ${starred ? 'star' : 'unstar'} receipt ${receiptId} for user ${user.id}`);

    // Update the receipt starred status
    const { data, error } = await authenticatedSupabase
      .from('receipts')
      .update({ starred })
      .eq('id', receiptId)
      .eq('user_id', user.id) // Ensure user can only star their own receipts
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      
      // Check if it's a column not found error
      if (error.code === 'PGRST204' && error.message.includes('starred')) {
        return res.status(400).json({ 
          success: false, 
          error: 'Starred feature not available - database column missing. Please add "starred" boolean column to receipts table.',
          needsDbUpdate: true,
          sqlCommand: 'ALTER TABLE receipts ADD COLUMN starred BOOLEAN DEFAULT false;'
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update receipt starred status',
        details: error.message
      });
    }

    console.log(`Successfully ${starred ? 'starred' : 'unstarred'} receipt ${receiptId}`);

    res.status(200).json({ 
      success: true, 
      receipt: data
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Unexpected error occurred' 
    });
  }
} 