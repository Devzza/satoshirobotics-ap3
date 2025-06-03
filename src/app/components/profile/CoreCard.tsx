"use client";

import { client } from "@/app/client";
import { useEffect, useState } from "react";
import { MediaRenderer, useActiveAccount, useSendTransaction, useWaitForReceipt } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { IoClose } from "react-icons/io5";
import { NFT } from "thirdweb";


type Props = {
  nft: NFT;
  baseContract: any;
  refetch: () => void;
};


export default function CoreCard({ nft, baseContract, refetch }: Props) {
const { name, image, description, attributes } = nft.metadata as {
  name: string;
  image: string;
  description?: string;
  attributes?: { trait_type: string; value: string }[];
};

  const account = useActiveAccount();

const tokenId = BigInt(nft.id); // si necesitas que sea bigint

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [isConfirming, setIsConfirming] = useState(false);
 

  // Función para convertir IPFS a gateway público
  const resolveImage = (url: string) => {
    if (!url) return "";
    return url.startsWith("ipfs://")
      ? url.replace("ipfs://", "https://ipfs.io/ipfs/")
      : url;
  };

  // Transfer



/*

  const { mutate: sendTransaction } = useSendTransaction();

  const onClickTransfer = () => {
    const transaction = prepareContractCall({
      contract: baseContract,
      method:
        "function safeTransferFrom(address from, address to, uint256 tokenId)",
      params: [account?.address || "", transferAddress, tokenId],
    });
    sendTransaction(transaction);
  };
*/


    const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTransferAddress(event.target.value);
  };
  


    const closeModal = () => {
    setIsModalOpen(false);
    refetch();
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