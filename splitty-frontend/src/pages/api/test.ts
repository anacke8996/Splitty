import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    return res.status(200).json({ 
      success: true, 
      message: 'Test endpoint working!',
      method: req.method,
      body: req.body
    });
  }

  return res.status(200).json({ 
    success: true, 
    message: 'Test endpoint working!',
    method: req.method 
  });
} 