"use client";

import { getNFTs, getOwnedNFTs, ownerOf, totalSupply } from "thirdweb/extensions/erc721";
import { BASE_CONTRACT, CAPSULES_CONTRACT, DISTRO_CONTRACT } from "../../../../constants/addresses";
import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { getContract, NFT, prepareContractCall, readContract, sendTransaction } from "thirdweb";
import { useReadContract,   useActiveAccount, useSendTransaction } from "thirdweb/react";
import { useEffect, useState } from "react";
import CapsCard from "./CapsCard";
import DistroCaps from "./DistroCaps";


export default function OwnedCaps() {

    const account = useActiveAccount();

   
    //--------------------OWNED BASE NFTs---------------------------------------------------------

         const baseContract = getContract({
        client: client,
        chain: chain,
        address: BASE_CONTRACT.address,
      });

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
    


 //--------------------OWNED CAPS NFTs---------------------------------------------------------

 
  const capsContract = getContract({
  client: client,
  chain: chain,
  address: CAPSULES_CONTRACT.address,
});

// Obtener cápsulas que posee la cuenta conectada
const [ownedCaps, setOwnedCaps] = useState<NFT[]>([]);
const [isLoadingCaps, setIsLoadingCaps] = useState(false);

const getOwnedCaps = async () => {
  setIsLoadingCaps(true);

  try {
    const rawTokenIds = await readContract({
      contract: capsContract,
      method: "function tokensOfOwner(address owner) view returns (uint256[])",
      params: [account?.address!],
    });

    const tokenIds = Array.from(rawTokenIds as bigint[]); // Forzamos como bigint[]

    const ownedNFTs: NFT[] = await Promise.all(
      tokenIds.map(async (tokenId) => {
        try {
          const uri: string = await readContract({
            contract: capsContract,
            method: "function tokenURI(uint256 tokenId) view returns (string)",
            params: [tokenId],
          });

const resolvedUri = uri
  .replace(/^ipfs:\/\/ipfs:\/\//, "https://ipfs.io/ipfs/")
  .replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");

console.log("Resolved URI for token", tokenId.toString(), ":", resolvedUri);

          const response = await fetch(resolvedUri);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const metadata = await response.json();

          return {
            id: tokenId,
            metadata,
          } as NFT;
        } catch (err) {
          console.warn(`Error fetching tokenURI for token ${tokenId.toString()}:`, err);
          return null;
        }
      })
    ).then((nfts) => nfts.filter((nft): nft is NFT => nft !== null));

    setOwnedCaps(ownedNFTs);
  } catch (err) {
    console.error("Error fetching capsules via tokensOfOwner:", err);
  }

  setIsLoadingCaps(false);
};



     useEffect(() => {
        if (account) {
            getOwnedCaps();
        }
    }, [account]);

      const handleRefetchClick = () => {
    console.log("Refetch button clicked!");
    getOwnedCaps(); // Llama a la función refetch al hacer clic en el botón
  };

 //--------------------DISTRO CAPS CONTRACT---------------------------------------------------------

 const capsDistro = getContract({
  client: client,
  chain: chain,
  address: DISTRO_CONTRACT.address,
});

const [capsuleData, setCapsuleData] = useState<
  { tokenId: bigint; baseTokenId: bigint; claimed: boolean }[]
>([]);

const [hasCapsuleToClaim, setHasCapsuleToClaim] = useState(false);

useEffect(() => {
  if (!account || ownedBase.length === 0) {
    console.log("No account or no base NFTs, skipping capsule info");
    setHasCapsuleToClaim(false);
    setCapsuleData([]);
    return;
  }

  const fetchCapsuleInfo = async () => {
    console.log("Fetching capsule info for owned base NFTs:", ownedBase.map((nft) => nft.id));
    const start = performance.now();

    const capsulePromises = ownedBase.map(async (nft) => {
      const tokenId = BigInt(nft.id);
      try {
        const [baseTokenId, claimed] = await Promise.all([
          readContract({
            contract: capsDistro,
            method: "function capsuleToBaseToken(uint256) view returns (uint256)",
            params: [tokenId],
          }),
          readContract({
            contract: capsDistro,
            method: "function capsuleClaimed(uint256) view returns (bool)",
            params: [tokenId],
          }),
        ]);

        console.log(`Capsule for token ${tokenId}:`, { baseTokenId, claimed });

        return { tokenId, baseTokenId, claimed };
      } catch (err) {
        console.error(`Error fetching capsule data for token ${tokenId}:`, err);
        return null;
      }
    });

    const capsuleResults = await Promise.all(capsulePromises);
    const results = capsuleResults.filter((result): result is { tokenId: bigint; baseTokenId: bigint; claimed: boolean } => result !== null);

    const foundCapsuleToClaim = results.some((result) => result.baseTokenId > 0 && !result.claimed);

    console.log("Capsule data:", results);
    console.log("Has capsule to claim:", foundCapsuleToClaim);
    console.log(`fetchCapsuleInfo took ${performance.now() - start}ms`);

    setCapsuleData(results);
    setHasCapsuleToClaim(foundCapsuleToClaim);
  };

  fetchCapsuleInfo();
}, [account, ownedBase]);

      


      



  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row gap-4 items-center">

      <h2 className="text-2xl font-bold my-8">Satoshi Robotics - Capsules</h2>
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


<div className="flex flex-col bg-[#1a1a1a] w-1/2 rounded-xl p-4 justify-center items-center mb-8">
 {isLoadingBase ? (
  <div>Checking Capsules to claim...</div>
) : ownedBase.length > 0 ? (
   hasCapsuleToClaim ? (
    <DistroCaps
      capsDistro={capsDistro}
      baseContract={baseContract}
      capsContract={capsContract}
      capsuleData={capsuleData}
      refetch={getOwnedCaps}
      getOwnedBase={getOwnedBase}
    />
  ) : (
    <div>Loading Capsules to claim...</div>
  )
) : (
  <div>
    <p>No capsules to claim</p>
  </div>
)}

</div>

<div className="flex flex-col justify-start">
      {isLoadingCaps ? (
      <div className="flex flex-col gap-4 justify-center items-center h-screen">
        <p>Loading Capsules...</p></div>
      ) : ownedCaps.length === 0 ? (
              <div className="flex flex-col gap-4 justify-center items-center h-screen">

        <p>No Capsules to open.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {ownedCaps.map((nft) => (
            <CapsCard key={nft.id} nft={nft} capsContract={capsContract} refetch={getOwnedCaps} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
