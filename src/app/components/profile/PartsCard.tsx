"use client";

import { client } from "@/app/client";
import React, { useEffect, useState } from "react";
import { MediaRenderer, useReadContract } from "thirdweb/react";
import { TRAITS_CONTRACT } from "../../../../constants/addresses";
import { getContract, readContract } from "thirdweb";
import { chain } from "@/app/chain";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";

type Props = {
    nft: {
      id: string | number;
      metadata: {
        name: string;
        description: string;
        image: string;
        attributes: { trait_type: string; value: string }[];
      };
    };
  };
  

  export default function PartsCard({ nft }: Props) {
    const { name, image, description, attributes } = nft.metadata;

          const traitsContract = getContract({
            client: client,
            chain: chain,
            address: TRAITS_CONTRACT.address,
          });


  const { data: mintedSupply, isLoading: isMintedLoading } = useReadContract({
    contract: TRAITS_CONTRACT,
    method:       
      "function totalSupply(uint256) view returns (uint256)",
    params: [BigInt(nft.id)],
});

  const { data: maxSupply, isLoading: isMaxLoading } = useReadContract({
    contract: TRAITS_CONTRACT,
    method: "function maxSupply(uint256) view returns (uint256)",
    params: [BigInt(nft.id)],
});


  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden border border-[#333] text-white">
<MediaRenderer
            client={client}
            src={nft.metadata.image}
            className="w-full rounded-t-lg mb-4"
            />
      <div className="p-4">
        <div className="flex flex-row justify-between text-sm items-center">
          {attributes && attributes.length > 0 && (
          <div className="text-sm text-gray-400">
            {attributes.map((attr, index) => (
              <div key={index} className="flex justify-between">
  {attr.trait_type !== "Author" && (
    <>
      <span className="text-gray-400">{attr.trait_type}:</span>
    </>
  )}
</div>
            ))}
          </div>
        )} 

                <p>ID: {nft.id}</p>

        </div>
      

        

          <h3 className="text-xl font-semibold my-2">{name}</h3>

        {/*
          {isMintedLoading || isMaxLoading
            ? "Loading..."
            : <p>{mintedSupply?.toString()} / {maxSupply?.toString()}</p>}
            */}


      </div>
    </div>
  );
}