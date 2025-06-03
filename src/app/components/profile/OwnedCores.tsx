"use client";

import { getNFTs, ownerOf, totalSupply } from "thirdweb/extensions/erc721";
import { BASE_CONTRACT } from "../../../../constants/addresses";
import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { getContract, NFT } from "thirdweb";
import { useReadContract,   useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";
import CoreCard from "./CoreCard";





export default function OwnedCores() {

    const account = useActiveAccount();
    

  const baseContract = getContract({
    client: client,
    chain: chain,
    address: BASE_CONTRACT.address,
  });

 //--------------------OWNED BASE NFTs---------------------------------------------------------


     // Obtener robots que posee la cuenta conectada
     const [ownedBase, setOwnedBase] = useState<NFT[]>([]);
     const [isLoadingBase, setIsLoadingBase] = useState(false); // Estado de carga
     const [selectedTokenId, setSelectedTokenId] = useState<number>(0);

     const getOwnedBase = async () => {
        setIsLoadingBase(true); // Activar loading antes de la consulta
         let ownedBase: NFT[] = [];
         
         try {
             const totalNFTSupply = await totalSupply({ contract: baseContract });
 
             const nfts = await getNFTs({
                 contract: baseContract,
                 start: 0,
                 count: parseInt(totalNFTSupply.toString()),
             });
 
             for (let nft of nfts) {
                 const owner = await ownerOf({
                     contract: baseContract,
                     tokenId: nft.id,
                 });
                 if (owner === account?.address) {
                    ownedBase.push(nft);
                 }
             }
 
             setOwnedBase(ownedBase);
         } catch (error) {
             console.error("Error fetching NFTs:", error);
         }
 
         setIsLoadingBase(false); // Desactivar loading después de la consulta
     };

     useEffect(() => {
        if (account) {
            getOwnedBase();
        }
    }, [account]);

      const handleRefetchClick = () => {
    console.log("Refetch button clicked!");
    getOwnedBase(); // Llama a la función refetch al hacer clic en el botón
  };

  return (
    <div>
      <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-4 items-center">

      <h2 className="text-2xl font-bold my-8">Satoshi Robotics</h2>
      {/* Refetch Button */}
      <button
        onClick={handleRefetchClick}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
      >
        Refetch
      </button>
      </div>
      <div>
       <a
            href="https://boredonchain.gitbook.io/satoshi-robotics-docs"
          target="_blank"
          rel="noopener noreferrer"
        >
         
          Docs →
        </a>
        </div>
      </div>

      {isLoadingBase ? (
        <p>Loading Robots...</p>
      ) : ownedBase.length === 0 ? (
        <p>No Robots yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ownedBase.map((nft) => (
            <CoreCard key={nft.id} nft={nft} baseContract={baseContract} refetch={getOwnedBase} />
          ))}
        </div>
      )}
    </div>
  );
}
