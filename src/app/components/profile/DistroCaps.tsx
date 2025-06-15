"use client";

import { getNFTs, ownerOf, totalSupply } from "thirdweb/extensions/erc721";
import { BASE_CONTRACT } from "../../../../constants/addresses";
import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { ContractOptions, getContract, NFT, prepareContractCall } from "thirdweb";
import { useReadContract,   useActiveAccount, TransactionButton, MediaRenderer } from "thirdweb/react";
import { useEffect, useState } from "react";

 interface DistroCapsProps {
capsDistro: ContractOptions<any, any>;    
baseContract: any;
getOwnedBase: () => Promise<void>
    capsContract: any;
    capsuleData: {
      tokenId: bigint;
      baseTokenId: bigint;
      claimed: boolean;
    }[];
  }
export default function DistroCaps({ capsDistro, capsContract, baseContract, capsuleData, getOwnedBase }: DistroCapsProps) {

        const [isModalOpen, setIsModalOpen] = useState(false);

               const openModal = () => {
  setIsModalOpen(true);  // Cerrar la modal
}; 
        const closeModal = () => {
  setIsModalOpen(false);  // Cerrar la modal
};

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };


    
    
    return (
      <div>
      
          <p>You have Capsules to claim!</p>
           <button
              onClick={openModal}
              className="mt-2 font-lexend flex items-center justify-center w-full px-6 py-2.5 text-center text-white duration-200 bg-black border-2 border-black rounded-lg inline-flex hover:bg-transparent hover:border-white focus:outline-none text-sm cursor-pointer"
            >
              Claim
            </button>
          
           {/*Modal*/}
     {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={closeModal}>
  <div className="bg-white p-6 rounded-lg max-h-[90vh] w-full max-w-2xl overflow-y-auto text-black" onClick={handleModalContentClick}
>
            {capsuleData.map((capsule) => (
              <div key={capsule.tokenId.toString()}>
                <p>Token ID: {capsule.tokenId.toString()}</p>
                <p>Claimed: {capsule.claimed ? "Yes" : "No"}</p>
                <TransactionButton
                  transaction={() =>
                    prepareContractCall({
                        contract: capsDistro,
                        method: "function claimCapsule(uint256 baseTokenId)",
                        params: [capsule.baseTokenId], // Use capsule.baseTokenId here
                    })
                  }
                  onTransactionConfirmed={() => {
                    alert("Capsule claimed!");
                    getOwnedBase();
                  }}
                  className={`w-full mt-2 px-4 py-2 rounded-xl transition ${
                    capsule.claimed
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  disabled={capsule.claimed} // Disable if already claimed
                >
                  {capsule.claimed ? "Already Claimed" : "Claim"}
                </TransactionButton>
              </div>
            ))}
            <button
              onClick={closeModal}
              className="mt-2 px-4 py-2 bg-gray-200 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
  };