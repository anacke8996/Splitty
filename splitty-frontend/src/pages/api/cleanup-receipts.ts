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

const RECENT_RECEIPTS_LIMIT = 15;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
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

    console.log(`Starting receipt cleanup for user ${user.id}`);

    // Step 1: Get all receipts for this user, sorted by creation date (newest first)
    const { data: allReceipts, error: fetchError } = await authenticatedSupabase
      .from('receipts')
      .select('id, created_at, starred')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching receipts for cleanup:', fetchError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch receipts for cleanup' 
      });
    }

    if (!allReceipts || allReceipts.length <= RECENT_RECEIPTS_LIMIT) {
      console.log(`User has ${allReceipts?.length || 0} receipts, no cleanup needed`);
      return res.status(200).json({ 
        success: true, 
        message: 'No cleanup needed',
        totalReceipts: allReceipts?.length || 0,
        deletedCount: 0
      });
    }

    // Step 2: Identify receipts to delete
    // Keep the most recent 15 receipts + all starred receipts (regardless of age)
    const recentReceipts = allReceipts.slice(0, RECENT_RECEIPTS_LIMIT);
    const olderReceipts = allReceipts.slice(RECENT_RECEIPTS_LIMIT);
    
    // From older receipts, only delete the unstarred ones
    const receiptsToDelete = olderReceipts.filter(receipt => !receipt.starred);
    const olderStarredReceipts = olderReceipts.filter(receipt => receipt.starred);

    if (receiptsToDelete.length === 0) {
      console.log(`All older receipts are starred, no cleanup needed`);
      return res.status(200).json({ 
        success: true, 
        message: 'All older receipts are starred, no cleanup needed',
        totalReceipts: allReceipts.length,
        deletedCount: 0,
        preservedStarred: olderStarredReceipts.length
      });
    }

    // Step 3: Delete old unstarred receipts
    const receiptIdsToDelete = receiptsToDelete.map(r => r.id);
    
    console.log(`Deleting ${receiptIdsToDelete.length} old unstarred receipts`);
    console.log(`Preserving ${recentReceipts.length} recent receipts + ${olderStarredReceipts.length} older starred receipts`);

    const { error: deleteError } = await authenticatedSupabase
      .from('receipts')
      .delete()
      .in('id', receiptIdsToDelete)
      .eq('user_id', user.id); // Extra safety check

    if (deleteError) {
      console.error('Error deleting old receipts:', deleteError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete old receipts',
        details: deleteError.message 
      });
    }

    console.log(`Successfully cleaned up ${receiptIdsToDelete.length} old receipts for user ${user.id}`);

    res.status(200).json({ 
      success: true, 
      message: 'Cleanup completed successfully',
      totalReceipts: allReceipts.length,
      deletedCount: receiptIdsToDelete.length,
      remainingReceipts: recentReceipts.length + olderStarredReceipts.length,
      preservedStarred: olderStarredReceipts.length
    });

  } catch (error) {
    console.error('Unexpected error during cleanup:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Unexpected error occurred during cleanup' 
    });
  }
} 