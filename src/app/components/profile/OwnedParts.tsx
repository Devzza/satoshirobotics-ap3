"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "@/app/client";
import { chain } from "@/app/chain";
import { getOwnedNFTs, nextTokenIdToMint } from "thirdweb/extensions/erc1155";
import { TRAITS_CONTRACT } from "../../../../constants/addresses";
import { getContract, NFT, readContract } from "thirdweb";
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
}, [client, chain]);

const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } =
  useReadContract({
    contract: traitsContract,
    method: "function nextTokenIdToMint() view returns (uint256)",
    params: [],
  });

const [ownedParts, setOwnedParts] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

const fetchTraits = useCallback(async () => {
  if (!account?.address || !totalNFTSupply) return;

  setLoading(true);

  try {
    const ownedTraits: NFT[] = [];

    const tokenIdArray = Array.from({ length: Number(totalNFTSupply) }, (_, i) => BigInt(i));

    // 1. Consultar todos los balances en paralelo
    const balancePromises = tokenIdArray.map((tokenId) =>
      readContract({
        contract: traitsContract,
        method: "function balanceOf(address, uint256) view returns (uint256)",
        params: [account?.address, tokenId],
      }).then((balance) => ({ tokenId, balance }))
    );

    const balances = await Promise.all(balancePromises);

    // 2. Filtrar los que sí posee
    const ownedTokenIds = balances.filter(({ balance }) => balance > BigInt(0));

    // 3. Obtener URIs + metadatos en paralelo
    const nftPromises = ownedTokenIds.map(async ({ tokenId, balance }) => {
      try {
        const rawUri = await readContract({
          contract: traitsContract,
          method: "function uri(uint256) view returns (string)",
          params: [tokenId],
        });

        const fixedUri = rawUri
          .replace("ipfs://ipfs/", "ipfs://")
          .replace("ipfs://", "https://ipfs.io/ipfs/");

        const metadata = await fetch(fixedUri).then((res) => res.json());

        const nft: NFT = {
          id: tokenId,
          metadata,
          owner: account.address,
          tokenURI: fixedUri,
          type: "ERC1155",
          supply: balance,
          tokenAddress: traitsContract.address as string,
          chainId: chain.id,
        };

        return nft;
      } catch (err) {
        console.warn(`Error fetching metadata for tokenId ${tokenId}:`, err);
        return null;
      }
    });

    const nfts = await Promise.all(nftPromises);

    // Filtra los nulls
const erc1155Nfts = nfts.filter((nft): nft is Extract<NFT, { type: "ERC1155" }> => nft !== null);
setOwnedParts(erc1155Nfts);  } catch (err) {
    console.error("Failed to fetch traits:", err);
  } finally {
    setLoading(false);
  }
}, [account?.address, totalNFTSupply, traitsContract, chain]);










useEffect(() => {
  if (!isTotalSupplyLoading) {
    fetchTraits();
  }
}, [fetchTraits, isTotalSupplyLoading]);

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