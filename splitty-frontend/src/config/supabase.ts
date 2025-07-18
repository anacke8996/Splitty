import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Receipt {
  id: string
  user_id: string
  restaurant_name: string
  total_amount: number
  currency: string
  source_currency?: string
  receipt_items: ReceiptItem[]
  participants: string[]
  split_results: SplitResult[]
  detected_language?: string
  completed_at?: string
  created_at: string
}

export interface ReceiptItem {
  name: string
  originalName: string
  price: number
  quantity: number
  total: number
  assignedTo: string[]
  type: 'regular' | 'shared' | 'discrete'
  isSpecialItem?: boolean
  specialType?: 'tax' | 'tip' | 'service_charge' | 'discount' | 'total'
  shareEqually?: boolean
}

export interface SplitResult {
  participant: string
  total: number
  currency: string
} 