// src/pages/api/links/index.ts
// Create and list links for TinyLink.
// Uses the Prisma client singleton (src/lib/prisma).
// Response shape is strict: { code, target, clicks, createdAt, lastClicked }

import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';

type LinkShape = {
  code: string;
  target: string;
  clicks: number;
  createdAt: string;
  lastClicked: string | null;
};

const generateCode = (len = 7) =>
  crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);

function toShape(row: any): LinkShape {
  return {
    code: row.code,
    target: row.target,
    clicks: row.clicks ?? 0,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    lastClicked: row.lastClicked ? new Date(row.lastClicked).toISOString() : null,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}

async function handleGet(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const links = await prisma.link.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' },
    });
    const payload = links.map(toShape);
    return res.status(200).json(payload);
  } catch (err) {
    console.error('GET /api/links error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { target, code: userCode } = req.body ?? {};

  // Validate presence of target
  if (!target || typeof target !== 'string') {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Validate URL using WHATWG URL
  try {
    // ensures it throws for invalid strings
    // also normalizes relative ones (but we expect absolute URLs)
    // eslint-disable-next-line no-new
    new URL(target);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Validate custom code if provided
  if (userCode) {
    if (typeof userCode !== 'string' || !/^[A-Za-z0-9]{6,8}$/.test(userCode)) {
      return res.status(400).json({ error: 'Invalid code' });
    }
  }

  let finalCode = userCode;

  // Generate unique code if not provided
  if (!finalCode) {
    let attempts = 0;
    while (attempts < 5) {
      const attempt = generateCode(7); // 6-8 allowed; using 7 by default
      // check uniqueness
      // note: using findUnique is fine here; conflict is handled on create too
      const existing = await prisma.link.findUnique({ where: { code: attempt } });
      if (!existing) {
        finalCode = attempt;
        break;
      }
      attempts++;
    }
    if (!finalCode) {
      return res.status(500).json({ error: 'Failed to generate unique code' });
    }
  } else {
    // Ensure user-supplied code is unique before trying to create
    const exists = await prisma.link.findUnique({ where: { code: finalCode } });
    if (exists) {
      return res.status(409).json({ error: 'Code already exists' });
    }
  }

  // Create DB record
  try {
    const newLink = await prisma.link.create({
      data: { code: finalCode, target },
    });
    return res.status(201).json(toShape(newLink));
  } catch (error: any) {
    // Unique constraint at DB level
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Code already exists' });
    }
    console.error('POST /api/links create error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}
