"use client"

import { MediaRenderer, TransactionButton, useSendTransaction } from "thirdweb/react";
import { getContract, NFT, prepareContractCall } from "thirdweb";
import { useState, useEffect } from "react";
import { getNFT } from "thirdweb/extensions/erc721";
import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { CAPSULES_CONTRACT, DISTRO_CONTRACT } from "../../../../constants/addresses";



export function CapsuleCard({
  tokenId,
  baseTokenId,
  claimed,
  refetch,
}: {
  tokenId: bigint;
  baseTokenId: bigint;
  claimed: boolean;
  refetch: () => Promise<void>;
}) {

    const [metadata, setMetadata] = useState<any>(null);


    const capsuleContract = getContract({
      client,
      chain,
      address: CAPSULES_CONTRACT.address,
    });

      const capsDistro = getContract({
        client: client,
        chain: chain,
        address: DISTRO_CONTRACT.address,
      });
  
    useEffect(() => {
      const fetchNFT = async () => {
        try {
          const nft = await getNFT({
            contract: capsuleContract,
            tokenId,
          });
  
          setMetadata(nft.metadata);
        } catch (err) {
          console.error("Error fetching NFT metadata:", err);
        }
      };
  
      fetchNFT();
    }, [tokenId]);

    const { mutate: sendTransaction } = useSendTransaction();

    const onClick = () => {
      const transaction = prepareContractCall({
        contract: capsDistro,
        method: "function claimCapsule(uint256 baseTokenId)",
        params: [baseTokenId],
      });
      sendTransaction(transaction);
    };
  
    if (!metadata) return <div className="w-64 p-4">Cargando...</div>;
  
    return (
        <div className="p-4 w-64 relative">
          <div className="relative w-full h-64 overflow-hidden rounded-md">
            <MediaRenderer
              src={metadata?.image || ""}
              client={client}
              alt={metadata?.name || "Capsule"}
              className={`rounded-xl object-cover w-full h-full transition-opacity duration-300 ${
                claimed ? "opacity-30" : "opacity-100"
              }`}
            />
      
            {claimed && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-semibold rounded-md">
                Claimed
              </div>
            )}
          </div>
      
          {/* 🔽 Botón de Claim aquí abajo */}
          <p>{metadata?.name || ""}</p>
          {!claimed && (
            <div>
            <button
            onClick={onClick}
            disabled={claimed}
            className={`w-full mt-2 px-4 py-2 rounded-xl transition ${
              claimed
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {claimed ? "Already Claimed" : "Claim"}
          </button>

          <TransactionButton
  transaction={() =>
    prepareContractCall({
      contract: capsDistro,
      method: "function claimCapsule(uint256 baseTokenId)",
      params: [baseTokenId],
    })
  }
  onTransactionConfirmed={() => {
    alert("Capsule claimed!");
    refetch();
  }}
  className={`w-full mt-2 px-4 py-2 rounded-xl transition ${
    claimed
      ? "bg-gray-400 cursor-not-allowed text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white"
  }`}
>
  {claimed ? "Already Claimed" : "Claim"}
</TransactionButton>



          </div>
          )}
        </div>
      );
      
  }