import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getContract, prepareContractCall, readContract } from "thirdweb";
import { MediaRenderer, useReadContract, useSendTransaction } from 'thirdweb/react';
import { BASE_CONTRACT } from '../../../constants/addresses';
import { chain } from '../chain';
import { client } from '../client';

interface Trait {
  layer_type: string;
  name: string;
}

interface Attribute {
  trait_type: string;
  value: string;
}

interface Metadata {
  name: string;
  description: string;
  image: string;
  canvas: string;
  driver: string;
  edition: number;
  date: number;
  attributes: Attribute[];
}

interface NFT {
  metadata: Metadata;
  tokenId: string;
}

interface NFTCanvasProps {
  ownedMechas: NFT[];
  selectedTokenId: number | null;
  traitTypes: string[];
  baseContract: any;
  traitsContract: any;
  refetch: () => Promise<void>;
  userImage: File | string | null;
  driverName: string;
  driverCID: string | null;
  isBodyEquipped: boolean;
  selectedTraits: Record<number, number>; // { traitTypeIndex: tokenId }
}

// Utilidad para convertir ipfs:// a https://
const getIpfsUrl = (ipfsUrl: string) =>
  ipfsUrl.startsWith("ipfs://") ? ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/") : ipfsUrl;

const RobotCanvas: React.FC<NFTCanvasProps> = ({
    ownedMechas,
    selectedTokenId,
    traitTypes,
    baseContract,
    traitsContract,
    refetch,
    userImage,
    driverName,
    driverCID,
    isBodyEquipped,
    selectedTraits,
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);
    const [traitImageUrls, setTraitImageUrls] = useState<{ [typeIndex: number]: string | null }>({});
  
    // Cargar imagen base
    useEffect(() => {
      if (selectedTokenId === null) return;
      const selectedNFT = ownedMechas.find(nft => Number(nft.tokenId) === selectedTokenId);
      if (selectedNFT) {
        const canvasUrl = getIpfsUrl(selectedNFT.metadata.canvas || selectedNFT.metadata.image);
        setBaseImageUrl(canvasUrl);
      }
    }, [selectedTokenId, ownedMechas]);
  
    // Cargar imágenes de traits
    useEffect(() => {
      const fetchTraitImages = async () => {
        if (!traitsContract || Object.keys(selectedTraits).length === 0) return;
  
        const newTraitImages: { [typeIndex: number]: string | null } = {};
  
        for (const [typeIndexStr, tokenId] of Object.entries(selectedTraits)) {
          const typeIndex = parseInt(typeIndexStr);
          try {
            const uri = await traitsContract.read("uri", [BigInt(tokenId)]);
            const metadataUrl = getIpfsUrl(uri).replace("{id}", tokenId.toString(16).padStart(64, "0"));
            const res = await fetch(metadataUrl);
            const metadata: Metadata = await res.json();
            newTraitImages[typeIndex] = getIpfsUrl(metadata.canvas || metadata.image);
          } catch (err) {
            console.error(`Error loading metadata for trait ${tokenId}:`, err);
            newTraitImages[typeIndex] = null;
          }
        }
  
        setTraitImageUrls(newTraitImages);
      };
  
      fetchTraitImages();
    }, [selectedTraits, traitsContract]);
  
    // Dibujar en canvas
    useEffect(() => {
      const draw = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !baseImageUrl) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
  
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        const loadImage = (src: string) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = err => reject(err);
            img.src = src;
          });
  
        try {
          // 1. Base
          const baseImg = await loadImage(baseImageUrl);
          ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
  
          // 2. Traits (ordenados por traitTypes)
          for (let i = 0; i < traitTypes.length; i++) {
            const uri = traitImageUrls[i];
            if (uri) {
              const img = await loadImage(uri);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
          }
  
          // 3. Imagen personalizada del usuario (opcional)
          if (userImage) {
            let userImgSrc = typeof userImage === "string" ? userImage : URL.createObjectURL(userImage);
            const userImg = await loadImage(userImgSrc);
            ctx.drawImage(userImg, 0, 0, canvas.width, canvas.height);
          }
  
          // 4. Texto del conductor (opcional)
          if (driverName) {
            ctx.font = "20px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(driverName, 20, canvas.height - 20);
          }
  
        } catch (err) {
          console.error("Error drawing canvas:", err);
        }
      };
  
      draw();
    }, [baseImageUrl, traitImageUrls, userImage, driverName, traitTypes]);
  
    return (
      <div className="flex flex-col items-center space-y-4">
<canvas ref={canvasRef} width="1024" height="1024" style={{ border: '1px solid black', width: '512px', height: '512px' }} />
</div>
    );
  };
  
  export default RobotCanvas;
  
