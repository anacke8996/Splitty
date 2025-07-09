import { NextApiRequest, NextApiResponse } from 'next';

interface Item {
  item: string;
  price: number;
  qty: number;
  total: number;
  converted_price?: number;
  converted_total?: number;
  shared_by?: string[];
  isSpecialItem?: boolean;
  specialType?: 'tax' | 'tip' | 'service_charge' | 'discount';
}

interface SplitBillRequest {
  items: Item[];
  participants: string[];
}

interface SplitBillResponse {
  [participant: string]: {
    items: Item[];
    total: number;
  };
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Split bill API called with body:', JSON.stringify(req.body, null, 2));
    
    const { items, participants }: SplitBillRequest = req.body;

    console.log('Extracted items:', items?.length || 0, 'items');
    console.log('Extracted participants:', participants?.length || 0, 'participants');

    if (!items || !participants) {
      console.log('Missing required fields - items:', !!items, 'participants:', !!participants);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Failsafe: Auto-assign special items to all participants if not already assigned
    const processedItems = items.map(item => {
      if (item.isSpecialItem && (!item.shared_by || item.shared_by.length === 0)) {
        console.log(`Auto-assigning special item "${item.item}" to all participants`);
        return {
          ...item,
          shared_by: [...participants]
        };
      }
      return item;
    });

    // Initialize response object
    const splitBill: SplitBillResponse = {};
    participants.forEach(participant => {
      splitBill[participant] = {
        items: [],
        total: 0
      };
    });

    console.log('Processing', processedItems.length, 'items for', participants.length, 'participants');

    // Process each item
    processedItems.forEach((item, index) => {
      const sharedBy = item.shared_by || [];
      console.log(`Item ${index + 1} (${item.item}): shared by`, sharedBy.length, 'people:', sharedBy);
      
      if (sharedBy.length === 0) {
        // If no one is assigned, skip the item
        console.log(`Skipping item ${index + 1} - no one assigned`);
        return;
      }

      const pricePerPerson = item.converted_total 
        ? item.converted_total / sharedBy.length 
        : item.total / sharedBy.length;

      console.log(`Item ${index + 1}: $${pricePerPerson.toFixed(2)} per person`);

      // Add item to each participant's list
      sharedBy.forEach(participant => {
        if (splitBill[participant]) {
          splitBill[participant].items.push({
            ...item,
            total: pricePerPerson
          });
          splitBill[participant].total += pricePerPerson;
        }
      });
    });

    // Round all totals to 2 decimal places
    Object.keys(splitBill).forEach(participant => {
      splitBill[participant].total = Number(splitBill[participant].total.toFixed(2));
    });

    console.log('Final split result:', JSON.stringify(splitBill, null, 2));

    return res.status(200).json(splitBill);

  } catch (error) {
    console.error('Error splitting bill:', error);
    return res.status(500).json({ error: 'Failed to split bill' });
  }
} 