import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    if (!process.env.PINATA_JWT) {
      return NextResponse.json({ error: 'Server misconfigured: missing PINATA_JWT' }, { status: 500 });
    }

    const body = await req.json();
    const { name, description, image } = body;

    if (!name || !description || !image) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const metadata = {
      name: name.trim(),
      description: description.trim(),
      image: image.trim()
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const pinataPayload = {
      pinataMetadata: {
        name: `metadata-DDNFT-${timestamp}`
      },
      pinataContent: metadata
    };

    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        Authorization: process.env.PINATA_JWT,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pinataPayload)
    });

    const data = await res.json();

    if (!res.ok || !data.IpfsHash) {
      return NextResponse.json({
        error: data?.error?.details || data?.error?.reason || 'Pinata upload failed'
      }, { status: 500 });
    }

    const metadataUrl = `ipfs://${data.IpfsHash}`;
    return NextResponse.json({ metadataUrl });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
