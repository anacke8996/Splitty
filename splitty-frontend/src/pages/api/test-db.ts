import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../config/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Test insertion with minimal data to see what columns are expected
    const testInsert = {
      user_id: '00000000-0000-0000-0000-000000000000', // Test UUID
      restaurant_name: 'Test Restaurant',
      total_amount: 10.00,
      currency: 'USD',
      starred: false // Test if starred column exists
    };

    console.log('Testing insert with minimal data:', testInsert);

    // Try to insert (it will fail but show us what columns are missing/unexpected)
    const { data: insertData, error: insertError } = await supabase
      .from('receipts')
      .insert(testInsert)
      .select()

    // Also try to get existing data
    const { data: selectData, error: selectError } = await supabase
      .from('receipts')
      .select('*')
      .limit(1)

    res.status(200).json({ 
      success: true, 
      message: 'Database schema test completed!',
      timestamp: new Date().toISOString(),
      testInsertResult: {
        data: insertData,
        error: insertError
      },
      existingDataResult: {
        data: selectData,
        error: selectError,
        availableColumns: selectData && selectData.length > 0 ? Object.keys(selectData[0]) : 'No existing data'
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Unexpected error occurred' 
    })
  }
} 