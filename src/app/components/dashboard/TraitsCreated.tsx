import { TRAITS_CONTRACT } from "../../../../constants/addresses";
import { getNFTs, nextTokenIdToMint } from "thirdweb/extensions/erc1155";
import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { useReadContract } from "thirdweb/react";
import { useEffect, useState } from "react";
import TraitsCard from "./TraitsCard";

interface Traits {
  type1: any[];
  type2: any[];
  type3: any[];
  type4: any[];
  type5: any[];
  type6: any[];
  type7: any[];
  type8: any[];
  type9: any[];
}

export default function TraitsCreated() {
  const traitsContract = getContract({
    client: client,
    chain: chain,
    address: TRAITS_CONTRACT.address,
  });

  const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract(
    nextTokenIdToMint,
    { contract: traitsContract }
  );

  const [traits, setTraits] = useState<Traits>({
    type1: [],
    type2: [],
    type3: [],
    type4: [],
    type5: [],
    type6: [],
    type7: [],
    type8: [],
    type9: [],
    });

  const [selectedTraitType, setSelectedTraitType] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraits = async () => {
      if (!totalNFTSupply) return;

      setLoading(true);
      const nfts = await getNFTs({
        contract: traitsContract,
        start: 0,
        count: Number(totalNFTSupply),
      });

      // Filtrar los traits por layer_type "Background"
      const filteredTraitsType1 = nfts.filter((nft: any) => nft.metadata.layer_type === "Background");

      // Filtrar los traits por layer_type "Back"
      const filteredTraitsType2 = nfts.filter((nft: any) => nft.metadata.layer_type === "Back");

      // Filtrar los traits por layer_type "Back"
      const filteredTraitsType3 = nfts.filter((nft: any) => nft.metadata.layer_type === "RightArm");

      // Filtrar los traits por layer_type "Back"
      const filteredTraitsType4 = nfts.filter((nft: any) => nft.metadata.layer_type === "Body");

      // Filtrar los traits por layer_type "Back"
      const filteredTraitsType5 = nfts.filter((nft: any) => nft.metadata.layer_type === "LeftArm");

      // Filtrar los traits por layer_type "Back"
      const filteredTraitsType6 = nfts.filter((nft: any) => nft.metadata.layer_type === "RightLeg");

      // Filtrar los traits por layer_type "Back"
      const filteredTraitsType7 = nfts.filter((nft: any) => nft.metadata.layer_type === "LeftLeg");

      // Filtrar los traits por layer_type "Back"
      const filteredTraitsType8 = nfts.filter((nft: any) => nft.metadata.layer_type === "Head");

      // Filtrar los traits por layer_type "Back"
      const filteredTraitsType9 = nfts.filter((nft: any) => nft.metadata.layer_type === "Accessories");

      setTraits({
        type1: filteredTraitsType1,
        type2: filteredTraitsType2,
        type3: filteredTraitsType3,
        type4: filteredTraitsType4,
        type5: filteredTraitsType5,
        type6: filteredTraitsType6,
        type7: filteredTraitsType7,
        type8: filteredTraitsType8,
        type9: filteredTraitsType9,
      });

      setLoading(false);
    };

    fetchTraits();
  }, [totalNFTSupply]);

  const handleTraitTypeSelect = () => {
    // Aquí podrías añadir la lógica para seleccionar los traits correspondientes
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Project M3CH4 - Traits Collection</h2>

      {loading || isTotalSupplyLoading ? (
        <p>Cargando Mechas...</p>
      ) : (
        <>
          {/* Desplegable para seleccionar el traitType */}
          <div className="mb-4">
            <label htmlFor="traitType" className="block font-medium">Selecciona un Trait Type</label>
            <select
              id="traitType"
              value={selectedTraitType ?? ""}
              onChange={(e) => setSelectedTraitType(Number(e.target.value))}
              className="mt-2 p-2 border border-gray-300 rounded text-white"
            >
              <option value="1" className="text-black hover:text-white">Background</option>
              <option value="2" className="text-black hover:text-white">Back</option>
              <option value="3" className="text-black hover:text-white">Right Arm</option>
              <option value="4" className="text-black hover:text-white">Body</option>
              <option value="5" className="text-black hover:text-white">Left Arm</option>
              <option value="6" className="text-black hover:text-white">Right Leg</option>
              <option value="7" className="text-black hover:text-white">Left Leg</option>
              <option value="8" className="text-black hover:text-white">Head</option>
              <option value="9" className="text-black hover:text-white">Accessories</option>

            </select>
          </div>

          {/* Renderizar el traitType seleccionado */}
          {selectedTraitType !== null && (
  <div className="mb-8">
    <h3 className="text-xl font-semibold my-4">
      {{
        1: "Backgrounds",
        2: "Backs",
        3: "Right Arms",
        4: "Bodies",
        5: "Left Arms",
        6: "Right Legs",
        7: "Left Legs",
        8: "Heads",
        9: "Accessories",
      }[selectedTraitType]}
    </h3>

    {traits[`type${selectedTraitType}` as keyof Traits]?.length === 0 ? (
      <div className="flex justify-center items-center">
      <p>
        No{" "}
        {{
          1: "Backgrounds",
          2: "Backs",
          3: "Right Arms",
          4: "Bodies",
          5: "Left Arms",
          6: "Right Legs",
          7: "Left Legs",
          8: "Heads",
          9: "Accessories",
        }[selectedTraitType]}{" "}
        yet.
      </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-12">
{traits[`type${selectedTraitType}` as keyof Traits].map((nft: any) => (
  <TraitsCard key={nft.id.toString()} nft={nft} selectedTraitType={selectedTraitType}
  />
        ))}
      </div>
    )}
  </div>
)}
        </>
      )}
    </div>
  );
}
