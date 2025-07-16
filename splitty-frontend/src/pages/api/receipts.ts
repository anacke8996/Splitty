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
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get authenticated user
    const authResult = await getUserFromAuth(req);
    if (!authResult) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { user, token } = authResult;

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

    // Fetch user's receipts from database
    const { data: receipts, error } = await authenticatedSupabase
      .from('receipts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch receipts' 
      });
    }

    res.status(200).json({ 
      success: true, 
      receipts: receipts || []
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Unexpected error occurred' 
    });
  }
} 