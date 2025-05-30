import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserInfoByCode } from '../../../lib/redis';
import { generateToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { code } = req.body;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Verification code required' });
  }
  
  try {
    // Get user info from Redis
    const userInfo = await getUserInfoByCode(code);
    
    if (!userInfo) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }
    
    // Generate JWT token
    const token = generateToken(userInfo);
    
    // Return user info and token
    return res.status(200).json({
      success: true,
      user: userInfo,
      token
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 