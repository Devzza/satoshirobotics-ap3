"use client";

import { useEffect, useState } from "react";
import { getOwnedNFTs } from "thirdweb/extensions/erc1155";
import { MediaRenderer, useActiveAccount } from "thirdweb/react";
import { chain } from "@/app/chain";
import { getContract } from "thirdweb";
import { client } from "@/app/client";
import { TRAITS_CONTRACT } from "../../../../constants/addresses";

export function CapsRewards() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

const account = useActiveAccount();

  useEffect(() => {
    const fetchRewards = async () => {
      if (!account || !chain) return;

      try {
        const contract = getContract({
          client,
          chain,
          address: TRAITS_CONTRACT.address,
        });

        const nfts = await getOwnedNFTs({
          contract,
          address: account.address,
          start: 0,
          count: 17, // ajusta según el número total de traits posibles
        });

        // Filtramos los que realmente tenga el usuario
        const owned = nfts.filter((nft) => Number(nft.quantityOwned) > 0);
        setRewards(owned);
      } catch (error) {
        console.error("Error fetching capsule rewards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [account, chain]);

  if (loading) {
    return (
      <div className="text-center text-blue-500 font-medium">
        Fetching your rewards...
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="text-center text-gray-500 font-medium">
        No rewards found in your wallet.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rewards.map((nft) => (
        <li
        key={nft.id.toString()}
        className="flex items-center space-x-4 bg-white p-3 rounded-xl shadow-md"
        >

                  <MediaRenderer
                    client={client}
                    src={nft.metadata.image}
                    className="w-[100px]"
                    alt={nft.metadata.name}
                    />
         
          <div>
            <h3 className="text-lg font-semibold">{nft.metadata.name}</h3>
            <p className="text-sm text-gray-600">{nft.metadata.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
