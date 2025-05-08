"use client";

import { client } from "@/app/client";
import React from "react";
import { MediaRenderer } from "thirdweb/react";

type Props = {
  nft: {
    metadata: {
      id: string;
      name: string;
      description?: string;
      image: string;
      attributes?: { trait_type: string; value: string }[];
    };
  };
};

export default function MechaCard({ nft }: Props) {
  const { name, image, description, attributes } = nft.metadata;

  // Función para convertir IPFS a gateway público
  const resolveImage = (url: string) => {
    if (!url) return "";
    return url.startsWith("ipfs://")
      ? url.replace("ipfs://", "https://ipfs.io/ipfs/")
      : url;
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl shadow-md overflow-hidden border border-[#333] text-white">
<MediaRenderer
            client={client}
            src={nft.metadata.image}
            className="w-full rounded-t-2xl mb-4"
            />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        {description && <p className="text-sm text-gray-300 mb-3">{description}</p>}

        {attributes && attributes.length > 0 && (
          <div className="text-sm text-gray-400 space-y-1">
            {attributes.map((attr, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-400">{attr.trait_type}:</span>
                <span className="text-gray-200">{attr.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}