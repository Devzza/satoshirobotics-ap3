"use client";

import { client } from "@/app/client";
import { useEffect, useState } from "react";
import { MediaRenderer, TransactionButton, useActiveAccount, useSendTransaction, useWaitForReceipt } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { IoClose } from "react-icons/io5";
import { NFT } from "thirdweb";
import { CapsRewards } from "./CapsRewards";


type Props = {
  nft: NFT;
  capsContract: any;
  refetch: () => void;
};


export default function CapsCard({ nft, capsContract, refetch }: Props) {
const { name, image, description, attributes } = nft.metadata as {
  name: string;
  image: string;
  description?: string;
  attributes?: { trait_type: string; value: string }[];
};

  const account = useActiveAccount();

const tokenId = BigInt(nft.id); // si necesitas que sea bigint

const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpening, setIsOpening] = useState(false);
 

  // Función para convertir IPFS a gateway público
  const resolveImage = (url: string | undefined) => {
    if (!url) return "";
    return url.startsWith("ipfs://")
      ? url.replace("ipfs://", "https://ipfs.io/ipfs/")
      : url;
  };


    const closeModal = () => {
    setIsModalOpen(false);
    refetch();
  };


  return (
    <div className="bg-[#1a1a1a] rounded-2xl shadow-md overflow-hidden border border-[#333] text-white">
<MediaRenderer
            client={client}
  src={(nft.metadata.image)}
            className="w-full rounded-t-2xl mb-4"
            />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>

        <TransactionButton
        onClick={() => {
          setIsModalOpen(true);
          setIsOpening(true);
        }}
        transaction={() =>
          prepareContractCall({
            contract: capsContract,
            method: "function openCapsule(uint256 capsuleId)",
            params: [tokenId],
          })
        }
        onTransactionConfirmed={() => {
          // Ocultar el loader del modal
          setIsOpening(false);
          refetch();
        }}
        className="w-full mt-2 px-4 py-2 rounded-xl"
      >
        Open
      </TransactionButton>
        
      </div>
        
      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center px-4">
    <div className="bg-[#0d0d0d] p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
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