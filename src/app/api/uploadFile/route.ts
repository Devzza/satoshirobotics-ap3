import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' });
    }

    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer]);

    const formData = new FormData();
    formData.append('file', blob, file.name);

    const pinataJWT = process.env.PINATA_JWT;

    if (!pinataJWT) {
      console.error('PINATA_JWT is not defined in .env file');
      return NextResponse.json({ success: false, message: 'PINATA_JWT is not defined in .env file' });
    }

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJWT}`,
      },
      body: formData,
    };

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', options);
    const json = await response.json();

    if (response.status === 200) {
      return NextResponse.json({ success: true, ipfsHash: json.IpfsHash });
    } else {
      console.error('Error al subir a IPFS:', json);
      return NextResponse.json({ success: false, message: 'Failed to upload to IPFS' });
    }
  } catch (error) {
    console.error('Error al subir a IPFS:', error);
    return NextResponse.json({ success: false, message: 'Failed to upload to IPFS' });
  }
}