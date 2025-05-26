"use client";

import { useMechas } from "@/context/MechasProvider";  // Importar el hook
import { getContract, NFT, readContract } from "thirdweb";
import { ConnectButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
import { createWallet } from "thirdweb/wallets";
import { OwnedMechasCard } from "../components/OwnedMechasCard";
import { client } from "../client";
import { chain } from "../chain";
import { BASE_CONTRACT, CAPSULES_CONTRACT, DISTRO_CONTRACT } from "../../../constants/addresses";
import { CapsuleCard } from "../components/mint/CapsuleCard";
import router from "next/router";
import { CapsuleCardSingle } from "../components/capsules/CapsuleCardSingle";


interface CapsuleCardSingleProps {
  tokenId: number;
  baseTokenId: number;
  claimed: boolean;
  refetch: () => void;
}

export default function Capsules() {
  const account = useActiveAccount();
  const { ownedNFTs, isLoading, refetch } = useMechas();  



  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("app.phantom"),
  ];

  const [capsuleData, setCapsuleData] = useState<
    { tokenId: bigint; baseTokenId: bigint; claimed: boolean }[]
  >([]);

  const capsDistro = getContract({
    client: client,
    chain: chain,
    address: DISTRO_CONTRACT.address,
  });

  useEffect(() => {
    if (!account || ownedNFTs.length === 0) return;

    const fetchCapsuleInfo = async () => {
      const results: {
        tokenId: bigint;
        baseTokenId: bigint;
        claimed: boolean;
      }[] = [];

      for (const nft of ownedNFTs) {
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
        } catch (err) {
          console.error(`Error fetching capsule data for token ${tokenId}:`, err);
        }
      }

      setCapsuleData(results);
    };

    fetchCapsuleInfo();
  }, [account, ownedNFTs]);

  

  return (
    <main className="w-full min-h-screen bg-[#0d0d0d] text-[#e5e5e5] font-lexend">
      <Navbar />

      {/* Si la cuenta no está conectada */}
          {!account ? (
      <div className="flex flex-col gap-4 justify-center items-center h-screen">
              <h1>Connect your wallet</h1>
             <ConnectButton 
                      client={client} 
                      wallets={wallets} 
                      connectModal={{ 
                          size: "compact", 
                          showThirdwebBranding: false 
                      }}
                      detailsButton={{
                          style: {
                              maxHeight: "50px",
                          }
                      }} 
                      />
            </div>
          // ) : ownedNFTs.length === 0 ? (
            /* Si la cuenta está conectada pero no tiene robots */
          //  <div className="flex justify-center items-center h-screen">
          //    <button
          //      onClick={() => router.push("/Mint")}
          //      className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
          //    >
          //      Mint your first robot
          //    </button>
          //  </div>
          ) : (

            /*Si la cuenta está conectada y tiene robots */
  
            <div className="flex flex-col justify-center items-center h-screen">
      <h2 className="text-xl font-semibold mb-4">Your Caps</h2>
  
      {isLoading && <p>Cargando NFTs...</p>}
      {!isLoading && capsuleData.length === 0 && (
        <p>You have no capsules to claim.</p>
      )}
  
      <div className="flex grid grid-cols-2 md:grid-cols-3 gap-4 justify-center items-center">
        {capsuleData.map(({ tokenId, baseTokenId, claimed }) => (
          <CapsuleCardSingle
            key={tokenId.toString()}
            tokenId={tokenId}
            baseTokenId={baseTokenId}
            claimed={claimed}
            refetch={refetch}
          />
        ))}
      </div>
  
      <button
        onClick={refetch}
        className="mt-4 mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
      >
        Refetch capsules
      </button>
    </div>
          )}
    </main>
  );
      
  
}
