"use client";

import { getNFTs, ownerOf, totalSupply } from "thirdweb/extensions/erc721";
import { BASE_CONTRACT } from "../../../../constants/addresses";
import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { getContract, NFT, readContract } from "thirdweb";
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
  setIsLoadingBase(true);
  setOwnedBase([]);

  try {
    const totalNFTSupply = await totalSupply({ contract: baseContract });
    const total = Number(totalNFTSupply.toString());

    // Creamos array de tokenIds del 0 al total - 1
    const tokenIds = Array.from({ length: total }, (_, i) => BigInt(i));

    // 1. Verificar ownership en paralelo
    const ownershipResults = await Promise.all(
      tokenIds.map(async (tokenId) => {
        try {
          const owner = await ownerOf({
            contract: baseContract,
            tokenId,
          });
          return { tokenId, owner };
        } catch (err) {
          console.warn(`Error getting owner of tokenId ${tokenId.toString()}:`, err);
          return null;
        }
      })
    );

    // 2. Filtrar solo los que son propiedad del usuario
    const ownedTokenIds = ownershipResults
      .filter(
        (res) =>
          res &&
          res.owner?.toLowerCase() === account?.address.toLowerCase()
      )
      .map((res) => res!.tokenId);

    // 3. Obtener tokenURIs y hacer fetch de metadata en paralelo
    const ownedNFTs: NFT[] = await Promise.all(
      ownedTokenIds.map(async (tokenId) => {
        try {
const uri = await readContract({
              contract: baseContract,
              method: "function tokenURI(uint256 tokenId) view returns (string)",
              params: [BigInt(tokenId)],
            });          const fixedUri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
          const metadata = await fetch(fixedUri).then((res) => res.json());

          return {
            id: tokenId,
            metadata,
          } as NFT;
        } catch (err) {
          console.warn(`Error loading metadata for token ${tokenId.toString()}:`, err);
          return null;
        }
      })
    ).then((nfts) => nfts.filter((nft): nft is NFT => nft !== null));

    setOwnedBase(ownedNFTs);
  } catch (err) {
    console.error("Error loading NFTs:", err);
  }

  setIsLoadingBase(false);
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
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2 cursor-pointer"
      >
        Refetch
      </button>
      </div>
      <div className="flex flex-row items-center gap-4">
        <a href="/mint" target="_blank" rel="noopener noreferrer">
            Mint
          </a>
          
            <a href="/canvas" target="_blank" rel="noopener noreferrer">
            Build
          </a>
          
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
