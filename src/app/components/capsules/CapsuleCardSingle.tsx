"use client"

import { MediaRenderer, TransactionButton, useSendTransaction } from "thirdweb/react";
import { getContract, NFT, prepareContractCall } from "thirdweb";
import { useState, useEffect } from "react";
import { getNFT } from "thirdweb/extensions/erc721";
import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { CAPSULES_CONTRACT, DISTRO_CONTRACT } from "../../../../constants/addresses";
import { CapsRewards } from "./CapsRewards";



export function CapsuleCardSingle({
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpening, setIsOpening] = useState(false);

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
           {/* Botón Open solo visible si está reclamada */}
    {claimed && (
      <TransactionButton
        onClick={() => {
          setIsModalOpen(true);
          setIsOpening(true);
        }}
        transaction={() =>
          prepareContractCall({
            contract: capsuleContract,
            method: "function openCapsule(uint256 capsuleId)",
            params: [tokenId],
          })
        }
        onTransactionConfirmed={() => {
          // Ocultar el loader del modal
          setIsOpening(false);
        }}
        className="w-full mt-2 px-4 py-2 rounded-xl"
      >
        Open
      </TransactionButton>
    )}
    
          {!claimed && (
            <div>
 

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

    

{isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center px-4">
    <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
      <button
        className="absolute top-4 right-4 text-xl text-gray-700"
        onClick={() => setIsModalOpen(false)}
      >
        ✕
      </button>

      {isOpening ? (
        <div className="flex flex-col items-center">
          <p className="text-lg text-blue-600 font-semibold mb-4">Opening Capsule...</p>
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold text-center text-blue-600 mb-4">You got:</h2>
          <ul className="space-y-2">
              <CapsRewards />
        
          </ul>
        </div>

      )}
    </div>
  </div>
)}

        </div>

        
      );
      
  }