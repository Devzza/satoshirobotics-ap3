"use client";

import { client } from "@/app/client";
import React, { useEffect, useState } from "react";
import { MediaRenderer, useReadContract } from "thirdweb/react";
import { TRAITS_CONTRACT } from "../../../../constants/addresses";
import { getContract, readContract } from "thirdweb";
import { chain } from "@/app/chain";
import { getCurrencyMetadata } from "thirdweb/extensions/erc20";

type Props = {
    nft: {
      id: string | number;
      metadata: {
        name: string;
        description: string;
        image: string;
        attributes: { trait_type: string; value: string }[];
      };
    };
    selectedTraitType: number;
  };
  

  export default function TraitsCard({ nft, selectedTraitType }: Props) {
    const { name, image, description, attributes } = nft.metadata;

          const traitsContract = getContract({
            client: client,
            chain: chain,
            address: TRAITS_CONTRACT.address,
          });


  const { data: mintedSupply, isLoading: isMintedLoading } = useReadContract({
    contract: TRAITS_CONTRACT,
    method:       
      "function totalSupply(uint256) view returns (uint256)",
    params: [BigInt(nft.id)],
});

  const { data: maxSupply, isLoading: isMaxLoading } = useReadContract({
    contract: TRAITS_CONTRACT,
    method: "function maxSupply(uint256) view returns (uint256)",
    params: [BigInt(nft.id)],
});

  const { data: price, isLoading: isPriceLoading } = useReadContract({
    contract: TRAITS_CONTRACT,
    method: "function prices(uint256) view returns (uint256)",
    params: [BigInt(nft.id)],
  });


  const [activePhase, setActivePhase] = useState<number>(0); 
  const [phaseLabel, setPhaseLabel] = useState<string>("Owner"); // Valor inicial por defecto
  

  useEffect(() => {
    const fetchActivePhase = async () => {
      try {
        const phase = await readContract({
          contract: TRAITS_CONTRACT,
          method: "function activePhase(uint256) view returns (uint8)",
          params: [BigInt(nft.id)],
        });
  
         // Asignar ambos valores al mismo tiempo
      setActivePhase(phase);

      switch (phase) {
        case 0:
          setPhaseLabel("Owner");
          break;
        case 1:
          setPhaseLabel("Private");
          break;
        case 2:
          setPhaseLabel("Public");
          break;
        default:
          setPhaseLabel("Unknown");
      }
    } catch (err) {
      console.error("Error fetching active phase:", err);
      setActivePhase(0);
      setPhaseLabel("Unknown");
    }
  };
  
    fetchActivePhase();
  }, [nft.id]);


  // Is ERC20 payment?
  const [priceLabel, setPriceLabel] = useState<string | null>(null);
const [erc20Metadata, setErc20Metadata] = useState<{
    symbol: string;
    decimals: number;
    address: string;
  } | null>(null);

  
useEffect(() => {
    const fetchPrice = async () => {
      try {

        const [
            phase,
            priceRaw,
            erc20Token,
            erc20Symbol,
            erc20Decimals,
            phaseSupply,
            claimedInPhase
          ] = await readContract({
            contract: traitsContract,
            method:
            "function claimConditions(uint256, uint8) view returns (uint8 phase, uint256 price, address erc20Token, string erc20Symbol, uint8 erc20Decimals, uint256 phaseSupply, uint256 claimedInPhase)",
            params: [BigInt(nft.id), activePhase],
          });
          
          console.log("🪙 claimConditions -> price:", priceRaw);
          console.log("🪙 claimConditions -> erc20Token:", erc20Token);
          console.log("🪙 claimConditions -> erc20Symbol:", erc20Symbol);
          console.log("🪙 claimConditions -> erc20Decimals:", erc20Decimals);
          
  
          if (erc20Token !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" && erc20Token !== "0x0000000000000000000000000000000000000000") {
            // Si el token ERC20 no es la dirección cero, entonces el pago es en ERC20
            const formattedPrice = Number(priceRaw) / 10 ** Number(erc20Decimals);
            setPriceLabel(`${formattedPrice} ${erc20Symbol}`);
            setErc20Metadata({
              address: erc20Token,
              symbol: erc20Symbol,
              decimals: Number(erc20Decimals),
            });
          } else {
            // Si la dirección ERC20 es la dirección cero, el pago es en el token nativo (APE)
            const formattedPrice = Number(priceRaw) / 1e18;
            setPriceLabel(`${formattedPrice} APE`);
          }
        } catch (err) {
          console.error("Error fetching price info:", err);
          setPriceLabel(null);
        }
      };
    
      fetchPrice();
    }, [nft.id, traitsContract, selectedTraitType, activePhase]);



  return (
    <div className="bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden border border-[#333] text-white">
<MediaRenderer
            client={client}
            src={nft.metadata.image}
            className="w-full rounded-t-lg mb-4"
            />
      <div className="p-4">
        <div className="flex flex-row justify-between text-sm">
        <p>ID: {nft.id}</p>
          {isMintedLoading || isMaxLoading
            ? "Loading..."
            : <p>{mintedSupply?.toString()} / {maxSupply?.toString()}</p>}
        </div>
        <h3 className="text-xl font-semibold my-2">{name}</h3>

        {attributes && attributes.length > 0 && (
          <div className="text-sm text-gray-400 space-y-1">
            {attributes.map((attr, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-400">{attr.trait_type}:</span>
                <span className="text-gray-200">{attr.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Phase & Price */}
        <div className="flex flex-col justify-center mt-4 gap-4">

        <div>
  {isPriceLoading || priceLabel === null ? (
    <span className="text-sm text-gray-400">Cargando precio...</span>
  ) : (
    <button className="bg-[#ff6700] text-black px-4 py-2 rounded w-full">
      {priceLabel} 
    </button>
  )}
</div>

{activePhase && (
  <div>
    <p
      className="text-sm text-white justify-center rounded-full">
      {phaseLabel}
    </p>
  </div>
)}


        </div>    


      </div>
    </div>
  );
}