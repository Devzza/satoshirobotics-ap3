"use client";

import { getNFTs, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { BASE_CONTRACT } from "../../../../constants/addresses";
import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { useEffect, useState } from "react";
import MechaCard from "./MechaCard";

export default function MechasCreated() {
  const baseContract = getContract({
    client: client,
    chain: chain,
    address: BASE_CONTRACT.address,
  });

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract(
    nextTokenIdToMint,
    { contract: baseContract }
  );

  const [mechas, setMechas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!totalNFTSupply) return;

      setLoading(true);
      const nfts = await getNFTs({
        contract: baseContract,
        start: 0,
        count: Number(totalNFTSupply),
      });
      setMechas(nfts);
      setLoading(false);
    };

    fetchNFTs();
  }, [totalNFTSupply]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Project M3CH4 Collection</h2>

      {loading || isTotalSupplyLoading ? (
        <p>Cargando Mechas...</p>
      ) : mechas.length === 0 ? (
        <p>No hay Mechas todavía.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mechas.map((nft) => (
            <MechaCard key={nft.id} nft={nft} />
          ))}
        </div>
      )}
    </div>
  );
}
