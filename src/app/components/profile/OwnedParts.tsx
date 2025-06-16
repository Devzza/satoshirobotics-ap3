"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "@/app/client";
import { chain } from "@/app/chain";
import { getOwnedNFTs, nextTokenIdToMint } from "thirdweb/extensions/erc1155";
import { TRAITS_CONTRACT } from "../../../../constants/addresses";
import { getContract } from "thirdweb";
import PartsCard from "./PartsCard";


export default function OwnedParts() {
  const account = useActiveAccount();
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("app.phantom"),
  ];

  // Memorizar el valor de traitsContract
  const traitsContract = useMemo(() => {
    return getContract({
      client: client,
      chain: chain,
      address: TRAITS_CONTRACT.address,
    });
  }, []);

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } =
    useReadContract(nextTokenIdToMint, { contract: traitsContract });


  const [ownedParts, setOwnedParts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

   const fetchTraits = useCallback(async () => {
    if (!totalNFTSupply || !account?.address) return;

    setLoading(true);

    try {
      // Fetch all NFTs owned by the account
      const nfts = await getOwnedNFTs({
        contract: traitsContract,
        start: 0,
        count: Number(totalNFTSupply),
        address: account?.address,
      });

      setOwnedParts(nfts);

      // Imprimir los NFTs obtenidos para verificar
      console.log("Owned Parts:", nfts);
    } catch (error) {
      console.error("Failed to fetch traits:", error);
      // Handle error appropriately, e.g., set an error state
    } finally {
      setLoading(false);
    }
  }, [totalNFTSupply, account?.address, traitsContract]);

  useEffect(() => {
    fetchTraits();
  }, [fetchTraits]);

   const handleRefetchClick = () => {
    console.log("Refetch button clicked!");
    fetchTraits(); // Llama a la función refetch al hacer clic en el botón
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-4 items-center">
          <h2 className="text-2xl font-bold my-8">
            Satoshi Robotics - Parts
          </h2>
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

      {loading ? (
        <p>Loading Robot Parts...</p>
      ) : (
        <>
           <div className="mb-8">
            {ownedParts.length === 0 ? (
              <div className="flex justify-center items-center">
                <p>No parts yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-12">
                {ownedParts.map((nft) => (
                  <PartsCard key={nft.id} nft={nft}/>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}