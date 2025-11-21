import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

function toShape(row: any) {
  return {
    code: row.code,
    target: row.target,
    clicks: row.clicks ?? 0,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    lastClicked: row.lastClicked ? new Date(row.lastClicked).toISOString() : null,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  if (!code || Array.isArray(code)) {
    return res.status(400).json({ error: 'Invalid code parameter' });
  }

  if (req.method === 'GET') return handleGet(String(code), res);
  if (req.method === 'DELETE') return handleDelete(String(code), res);

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

async function handleGet(code: string, res: NextApiResponse) {
  try {
    const link = await prisma.link.findUnique({ where: { code } });
    if (!link || link.deleted) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(toShape(link));
  } catch (err) {
    console.error('GET /api/links/[code] error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handleDelete(code: string, res: NextApiResponse) {
  try {
    const link = await prisma.link.findUnique({ where: { code } });
    if (!link || link.deleted) {
      return res.status(404).json({ error: 'Not found' });
    }

    await prisma.link.update({ where: { code }, data: { deleted: true } });
    // Success: 204 No Content (no body)
    return res.status(204).end();
  } catch (err) {
    console.error('DELETE /api/links/[code] error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
