import { NextResponse } from 'next/server';
import Busboy from 'busboy';
import { Readable } from 'stream';
import { fileTypeFromBuffer } from 'file-type';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const busboy = Busboy({ headers: { 'content-type': contentType } });

    let fileBuffer: Buffer | null = null;
    let fileName = 'nft-image';
    let mimeType = '';
    let fileSize = 0;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    const buffers: Buffer[] = [];

    const finished = new Promise<void>((resolve, reject) => {
      busboy.on('file', (_field, file, fileInfo) => {
        if (fileInfo && typeof fileInfo === 'object' && 'filename' in fileInfo) {
          fileName = fileInfo.filename as string;
        }

        file.on('data', (chunk: Buffer) => {
          fileSize += chunk.length;
          buffers.push(chunk);
        });

        file.on('end', () => {
          fileBuffer = Buffer.concat(buffers);
        });
      });

      busboy.on('finish', resolve);
      busboy.on('error', reject);

      Readable.fromWeb(req.body as any).pipe(busboy);
    });

    await finished;

    if (!fileBuffer) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const fileType = await fileTypeFromBuffer(fileBuffer);
    mimeType = fileType?.mime || '';

    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json({ error: `Invalid file type: ${mimeType}` }, { status: 400 });
    }

    if (fileSize > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const formData = new FormData();
    const file = new File([fileBuffer], fileName, { type: mimeType });
    formData.append('file', file);

    const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: process.env.PINATA_JWT!,
      },
      body: formData,
    });

    const pinataData = await pinataRes.json();

    if (!pinataRes.ok || !pinataData.IpfsHash) {
      console.error("Pinata upload failed:", pinataData);
      return NextResponse.json({
        error: pinataData?.error?.details || pinataData?.error?.reason || 'Upload Pinata failed'
      }, { status: 500 });
    }

    return NextResponse.json({
      cid: pinataData.IpfsHash,
      url: `ipfs://${pinataData.IpfsHash}`,
    });

  } catch (err: any) {
    console.error("Upload API error:", err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
