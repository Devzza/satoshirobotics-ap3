"use client";

import { getContract } from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { DISTRO_CONTRACT } from "../../../../constants/addresses";
import { chain } from "../../chain";
import { client } from "../../client";
import { useEffect, useState } from "react";
import { readContract } from "thirdweb";
import { useMechas } from "@/context/MechasProvider";
import { CapsuleCard } from "./CapsuleCard";

export function ClaimCapsules() {
  const account = useActiveAccount();
  const { ownedNFTs, isLoading, refetch } = useMechas();


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
    <div className="overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Your Caps</h2>
  
      {isLoading && <p>Cargando NFTs...</p>}
      {!isLoading && capsuleData.length === 0 && (
        <p>You have no capsules to claim.</p>
      )}
  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {capsuleData.map(({ tokenId, baseTokenId, claimed }) => (
          <CapsuleCard
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
        className="mt-4 mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        Refrescar cápsulas
      </button>
    </div>
  );
}
