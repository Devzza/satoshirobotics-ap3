import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const pinataJWT = process.env.PINATA_JWT;

    if (!pinataJWT) {
      console.error('PINATA_JWT is not defined in .env file');
      return NextResponse.json({ success: false, message: 'PINATA_JWT is not defined in .env file' });
    }

    const { metadata, selectedTokenId } = await req.json();

    const timestamp = Date.now();
    const fileName = `Satoshi_AP3_Robot_#${selectedTokenId}_${timestamp}.json`;

    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: fileName }, // 🔹 Añade el nombre aquí
      }),
    };

    const response = await fetch(url, options);
    const result = await response.json();

    if (response.status === 200) {
      console.log("Metadata uploaded to IPFS:", result.IpfsHash);
      return NextResponse.json({ success: true, ipfsHash: result.IpfsHash });
    } else {
      console.error('Error al subir metadata a IPFS:', result);
      return NextResponse.json({ success: false, message: `Error uploading metadata to IPFS: ${result.error}` });
    }
  } catch (error) {
    console.error("Error uploading metadata:", error);
    return NextResponse.json({ success: false, message: 'Failed to upload metadata to IPFS' });
  }
}