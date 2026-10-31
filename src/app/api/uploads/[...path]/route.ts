import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const MIME_MAP: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = params.path || [];
    if (segments.some((s) => s.includes('..') || s.includes('\\'))) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads');
    const targetPath = path.resolve(uploadsRoot, ...segments);

    if (!targetPath.startsWith(uploadsRoot)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const fileBuffer = await fs.readFile(targetPath);
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not Found', { status: 404 });
  }
}
