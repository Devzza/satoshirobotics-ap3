"use client";

import { getNFTs, ownerOf, totalSupply } from "thirdweb/extensions/erc721";
import { BASE_CONTRACT } from "../../../../constants/addresses";
import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { ContractOptions, getContract, NFT, prepareContractCall } from "thirdweb";
import { useReadContract,   useActiveAccount, TransactionButton, MediaRenderer } from "thirdweb/react";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import Image from "next/image";


 interface DistroCapsProps {
capsDistro: ContractOptions<any, any>;    
baseContract: any;
refetch:  () => Promise<void>;
getOwnedBase: () => Promise<void>
    capsContract: any;
    capsuleData: {
      tokenId: bigint;
      baseTokenId: bigint;
      claimed: boolean;
    }[];
  }
export default function DistroCaps({ capsDistro, capsContract, baseContract, capsuleData, refetch, getOwnedBase }: DistroCapsProps) {

        const [isModalOpen, setIsModalOpen] = useState(false);

               const openModal = () => {
  setIsModalOpen(true);  // Cerrar la modal
}; 
        const closeModal = () => {
  setIsModalOpen(false);  // Cerrar la modal
  refetch();
};

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };


  
    
    
    return (
      <div>
      <div className="flex flex-col justify-center items-center">
          <p>You have Capsules to claim!</p>
           <button
              onClick={openModal}
              className="mt-2 font-lexend flex items-center justify-center w-full px-6 py-2.5 text-center text-white duration-200 bg-black border-2 border-black rounded-lg inline-flex hover:bg-transparent hover:border-white focus:outline-none text-sm cursor-pointer"
            >
              Claim
            </button>
            </div>
          
           {/*Modal*/}
     {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={closeModal}>
  <div className="bg-[#0d0d0d] p-6 rounded-lg max-h-[90vh] w-full max-w-2xl overflow-y-auto text-white" onClick={handleModalContentClick}>

  <div className="flex justify-end"><button className="cursor-pointer text-lg" onClick={closeModal}><IoClose /></button></div>

  <div><h1 className="font-bold text-xl">Claim your Capsules:</h1></div>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
  {capsuleData
    .filter((capsule) => !capsule.claimed) // ⛔️ Oculta las ya reclamadas
    .map((capsule) => (
      <div key={capsule.tokenId.toString()}>
        <div className="bg-[#1a1a1a] text-white rounded-xl">
          <div>
            <img src="/capsule.png" alt="Capsule image" className="rounded-t-xl" />
          </div>
          <div className="flex flex-col gap-4 p-4">
            <p>Capsule #{capsule.tokenId.toString()}</p>
            <TransactionButton
              transaction={() =>
                prepareContractCall({
                  contract: capsDistro,
                  method: "function claimCapsule(uint256 baseTokenId)",
                  params: [capsule.baseTokenId],
                })
              }
              onTransactionConfirmed={() => {
                alert("Capsule claimed!");
                getOwnedBase();
                refetch(); // Puedes añadir también: fetchCapsuleInfo();
              }}
              className="w-1/3 mt-2 px-4 py-2 rounded-xl transition bg-blue-600 hover:bg-blue-700 text-white"
            >
              Claim
            </TransactionButton>
          </div>
        </div>
      </div>
  ))}
</div>

            
          </div>
        </div>
      )}
    </div>
  );
  };