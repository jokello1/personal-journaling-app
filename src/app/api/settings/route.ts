import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    try {
      const { darkMode, emailNotifications } = req.body;
      
      const updatedSettings = await prisma.settings.upsert({
        where: { userId: session.user.id },
        update: {
          darkMode,
          emailNotifications
        },
        create: {
          userId: session.user.id,
          darkMode,
          emailNotifications
        }
      });

      return res.status(200).json(updatedSettings);
    } catch (error) {
      console.error('Settings update error:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  if (req.method === 'GET') {
    try {
      const settings = await prisma.settings.findUnique({
        where: { userId: session.user.id }
      });

      return res.status(200).json(settings || {
        darkMode: false,
        emailNotifications: true
      });
    } catch (error) {
      console.error('Settings fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}