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
    
         const getOwnedBase = async () => {
  setIsLoadingBase(true);
  try {
    const nfts = await getOwnedNFTs({
      contract: baseContract,
      owner: account?.address!,
    });

    setOwnedBase(nfts);
  } catch (error) {
    console.error("Error fetching owned NFTs:", error);
  }
  setIsLoadingBase(false);
};
    
         useEffect(() => {
            if (account) {
                getOwnedBase();
                console.log(ownedBase)
            }
        }, [account]);
    


 //--------------------OWNED CAPS NFTs---------------------------------------------------------

 
  const capsContract = getContract({
    client: client,
    chain: chain,
    address: CAPSULES_CONTRACT.address,
  });


     // Obtener capsulas  que posee la cuenta conectada
     const [ownedCaps, setOwnedCaps] = useState<NFT[]>([]);
     const [isLoadingCaps, setIsLoadingCaps] = useState(false); // Estado de carga

     const getOwnedCaps = async () => {
  setIsLoadingCaps(true);
  try {
    const nfts = await getOwnedNFTs({
      contract: capsContract,
      owner: account?.address!,
    });

    setOwnedCaps(nfts);
  } catch (error) {
    console.error("Error fetching owned NFTs:", error);
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
      setHasCapsuleToClaim(false);
      return;
    }

    const fetchCapsuleInfo = async () => {
      const results: {
        tokenId: bigint;
        baseTokenId: bigint;
        claimed: boolean;
      }[] = [];

      let foundCapsuleToClaim = false;

      for (const nft of ownedBase) {
        const tokenId = BigInt(nft.id);

        try {
          const baseTokenId = await readContract({
            contract: capsDistro,
            method: "function capsuleToBaseToken(uint256) view returns (uint256)",
            params: [tokenId],
          });

          const claimed = await readContract({
            contract: capsDistro,
            method: "function capsuleClaimed(uint256) view returns (bool)",
            params: [tokenId],
          });

          results.push({ tokenId, baseTokenId, claimed });

          if (baseTokenId > 0 && !claimed) {
            foundCapsuleToClaim = true;
          }
        } catch (err) {
          console.error(
            `Error fetching capsule data for token ${tokenId}:`,
            err
          );
        }
      }

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
