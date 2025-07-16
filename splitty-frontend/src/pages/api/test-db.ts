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
    // Test basic connection
    const { data, error } = await supabase
      .from('receipts')
      .select('count')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned, which is fine
      console.error('Database connection error:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Database connection failed',
        details: error.message 
      })
    }

    res.status(200).json({ 
      success: true, 
      message: 'Database connection successful!',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Unexpected error occurred' 
    })
  }
} 