import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const pinataJWT = process.env.PINATA_JWT;

    if (!pinataJWT) {
      console.error('PINATA_JWT is not defined in .env file');
      return NextResponse.json({ success: false, message: 'PINATA_JWT is not defined in .env file' });
    }

    const data = await req.formData();
    const file = data.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' });
    }

    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

    const formData = new FormData();
    formData.append('file', file);

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pinataJWT}`,
      },
      body: formData,
    };

    const response = await fetch(url, options);
    const result = await response.json();

    if (response.status === 200) {
      console.log("File uploaded to IPFS:", result.IpfsHash);
      return NextResponse.json({ success: true, ipfsHash: result.IpfsHash });
    } else {
      console.error('Error uploading file to IPFS:', result);
      return NextResponse.json({ success: false, message: `Error uploading file to IPFS: ${result.error}` });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ success: false, message: 'Failed to upload file to IPFS' });
  }
}