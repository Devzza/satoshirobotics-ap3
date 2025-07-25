"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getContract, NFT, prepareContractCall, readContract, toEther } from "thirdweb";
import {
  MediaRenderer,
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { client } from "../client";
import { chain } from "../chain";
import { BASE_CONTRACT, TRAITS_CONTRACT } from "../../../constants/addresses";
import { getOwnedNFTs } from "thirdweb/extensions/erc1155";
import React from "react";



interface TraitsCardProps {
  ownedTraits: any;
  contract: any;
  baseContract: string;
  account: string;
  tokenId: number;
  traitId: number | null;
  equippedTraits: Record<number, number | null>;
  onClickEquip: (traitId: number) => void;
  onClickUnequip: (traitId: number) => void;
  selectedTraits: Record<number, number>;
    setSelectedTraits: React.Dispatch<React.SetStateAction<Record<number, number>>>;
    selectedSlot: number | null; 
    tempSelectedTrait: Record<number, number>;
    setTempSelectedTrait: React.Dispatch<React.SetStateAction<Record<number, number>>>;
}


interface Attribute {
  trait_type: string;
  value: string;
}


export const TraitsCard: React.FC<TraitsCardProps> = ({
  ownedTraits,
  contract,
  baseContract,
  account,
  tokenId,
  traitId,
  equippedTraits,
  onClickEquip,
  onClickUnequip,
  selectedTraits,
  setSelectedTraits,
  selectedSlot,
  tempSelectedTrait,
  setTempSelectedTrait,
}) => {


const handleSelectTrait = (traitId: number) => {
  setTempSelectedTrait((prev) => {
    const updated = { ...prev };
    if (updated[selectedSlot || 0] === traitId) {
      delete updated[selectedSlot || 0];
    } else {
      updated[selectedSlot || 0] = traitId;
    }
    return updated;
  });
};

const isSelected = (traitId: number) => {
  return tempSelectedTrait[selectedSlot || 0] === traitId;
};

  // Obtener los traits del slot correspondiente
  const traitsForSlot = ownedTraits[selectedSlot || 0] || [];

  //mediarenderer -> className="border-4 border-solid border-[#00000]"

    
    return (
      <div key={ownedTraits.id} className="relative h-auto w-full">
        <div className="flex flex-col items-center justify-center">
          <MediaRenderer
            client={client}
            src={ownedTraits.metadata.image}
            style={{
              borderRadius: "15px",
              width: "200px",
              height: "200px",
              marginBottom: "20px",
            }}
          />
          <p className="text-lg font-bold">{ownedTraits.metadata.name || "No Name"}</p>

                     {/* Equipar/Desequipar botones */}
                     {equippedTraits[selectedSlot || 0] === ownedTraits.id ? (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClickUnequip(ownedTraits.id);
    }}
    className="bg-red-500 text-white py-2 px-4 rounded-lg mt-4"
  >
    Desequipar
  </button>
) : (
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleSelectTrait(ownedTraits.id); // Solo seleccionamos el trait aquí
    }}
    className={`cursor-pointer py-2 px-4 rounded-lg mt-4 hover:bg-blue-500 ${
      isSelected(ownedTraits.id) ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-transparent border-3 border-blue-500 text-white'
    }`}
  >
    {isSelected(ownedTraits.id) ? 'Selected' : 'Select'}
  </button>
)}
        </div>
      </div>
    );
  };












interface OwnedTraitsProps {
    tokenId: number;
    traitTypes: string[]; 
    selectedSlot: number | null; 
    onClose: () => void; // Agregamos esta prop para cerrar el modal
    equippedTraits: Record<number, number | null>;
    selectedTraits: Record<number, number>;
    setSelectedTraits: React.Dispatch<React.SetStateAction<Record<number, number>>>;
    onClickEquip: (traitId: number) => void
    onClickUnequip: (traitId: number) => void
    tempSelectedTrait: Record<number, number>;
    setTempSelectedTrait: React.Dispatch<React.SetStateAction<Record<number, number>>>;
    toEquip: number[]
    setToEquip: React.Dispatch<React.SetStateAction<number[]>>
    toUnequip: number[]
    setToUnequip: React.Dispatch<React.SetStateAction<number[]>>
    ownedTraitURIs: {
      [key: number]: string | undefined;
      }
  setOwnedTraitURIs: React.Dispatch<React.SetStateAction<{
    [key: number]: string | undefined;
    }>>

  }

  interface Trait {
  metadata?: {
    layer_type?: string;
  };
  name: string;
}
  
  export const OwnedTraits = ({  
    tokenId, 
    traitTypes, 
    selectedSlot, 
    onClose, 
    equippedTraits, 
    selectedTraits,
    setSelectedTraits,
    onClickEquip,
    onClickUnequip,
    tempSelectedTrait,
    setTempSelectedTrait,
    toEquip,
    setToEquip,
    toUnequip,
    setToUnequip,
    ownedTraitURIs,
    setOwnedTraitURIs,
  }: OwnedTraitsProps) => {
    const account = useActiveAccount();
     

    const baseContract = useMemo(() => {
        return getContract({
          client: client,
          chain: chain,
          address: BASE_CONTRACT.address,
        });
      }, [account, chain]);

    const traitsContract = useMemo(() => {
      return getContract({
        client: client,
        chain: chain,
        address: TRAITS_CONTRACT.address,
      });
    }, [account, chain]);

    // Mapeo de tipos de traits a slots numéricos
const TRAIT_TYPE_TO_SLOT: Record<string, number> = {
    Background: 1,
    Back: 2,
    RightArm: 3,
    Body: 4,
    LeftArm: 5,
    RightLeg: 6,
    LeftLeg: 7,
    Head: 8,
    Accessories: 9,
  };

  const [ownedTraits, setOwnedTraits] = useState<Record<number, any[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } =
      useReadContract({
        contract: traitsContract,
        method: "function nextTokenIdToMint() view returns (uint256)",
        params: [],
      });
  
 const fetchTraits = useCallback(async () => {
  if (!account?.address || !totalNFTSupply) return;
  setIsLoading(true);

  try {
    const tokenIdArray = Array.from({ length: Number(totalNFTSupply) }, (_, i) => BigInt(i));

    // 1. Obtener balances
    const balancePromises = tokenIdArray.map((tokenId) =>
      readContract({
        contract: traitsContract,
        method: "function balanceOf(address, uint256) view returns (uint256)",
        params: [account.address, tokenId],
      }).then((balance) => ({ tokenId, balance }))
    );

    const balances = await Promise.all(balancePromises);
    const ownedTokenIds = balances.filter(({ balance }) => balance > BigInt(0));

    // 2. Obtener metadata
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
    const erc1155Nfts = nfts.filter((nft): nft is Extract<NFT, { type: "ERC1155" }> => nft !== null);

    // 3. Clasificar por slot
    const filteredTraits: Record<number, NFT[]> = {};

    for (const slot of traitTypes) {
      filteredTraits[Number(slot)] = [];
    }

    for (const nft of erc1155Nfts) {
const layerType = (nft.metadata as any)?.layer_type;

if (typeof layerType !== "string") {
  console.warn("Invalid or missing layer_type in metadata:", nft.metadata);
  continue;
}

const slot = TRAIT_TYPE_TO_SLOT[layerType];;

      if (slot !== undefined) {
        if (!filteredTraits[slot]) filteredTraits[slot] = [];
        filteredTraits[slot].push(nft);
      }
    }

    console.log("Filtered Traits by Slot:", filteredTraits);
    setOwnedTraits(filteredTraits);
  } catch (err) {
    console.error("Failed to fetch traits:", err);
  } finally {
    setIsLoading(false);
  }
}, [account?.address, totalNFTSupply, traitsContract, traitTypes, chain]);


  
  useEffect(() => {
    fetchTraits();
  }, [account, traitsContract, traitTypes]);
  

  // Si no hay slot seleccionado, no mostrar nada
  if (selectedSlot === null) return null;




   // Aseguramos que ownedTraits[selectedSlot] esté definido y tenga datos
   const hasTraits = selectedSlot !== null && ownedTraits[selectedSlot]?.length > 0;

   useEffect(() => {
     // Si no hay traits, refrescar
     if (!hasTraits) {
       fetchTraits(); // Cargar traits si no están disponibles
     }
   }, [selectedSlot, ownedTraits]);

 

    // Invertimos el mapeo para obtener el nombre del slot desde su número
const SLOT_TO_TRAIT_TYPE: Record<number, string> = Object.entries(TRAIT_TYPE_TO_SLOT).reduce(
  (acc, [traitType, slot]) => {
    acc[slot] = traitType;
    return acc;
  },
  {} as Record<number, string>
);


// setOwnedTraitURIs y lo pasamos a parent

 const fetchOwnedTraitsMetadata = async () => {
    console.log("fetchOwnedTraitsMetadata fue llamada!"); // ⚡️ LOG DE VERIFICACIÓN

    if (!traitsContract || Object.keys(ownedTraits).length === 0) return;

      console.log("ownedTraits:", ownedTraits); // ⚡️ LOG DE ownedTraits


    const uris: { [key: number]: string | undefined } = {};

    for (const type of Object.keys(ownedTraits)) {
      const traitObject = ownedTraits[parseInt(type)]?.[0];
        console.log(`traitObject for type ${type}:`, traitObject); // ⚡️ LOG DE traitObject


      if (traitObject != null) {
        // Extraer un tokenId seguro
        const tokenId =
          typeof traitObject === "object"
            ? traitObject.id ?? traitObject.tokenId ?? traitObject[0]
            : traitObject;

              console.log(`tokenId for type ${type}:`, tokenId); // ⚡️ LOG DE tokenId


        if (tokenId != null) {
          try {
            // Evita hacer llamadas duplicadas
            if (!uris[parseInt(type)]) {
              const uri = await readContract({
                contract: traitsContract,
                method: "function uri(uint256 tokenId) view returns (string)",
                params: [BigInt(tokenId)],
              });

              // Cargar metadata desde la URI
              const metadataUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
              const metadataResponse = await fetch(metadataUrl);
              const metadata = await metadataResponse.json();

                  console.log("Metadata object:", metadata); // ⚡️ LOG CRÍTICO

              const ownedImageUrl = metadata.image
                ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                : null;

              uris[parseInt(type)] = ownedImageUrl;
            }
          } catch (error) {
            console.error(`Error fetching metadata for tokenId ${tokenId}:`, error);
              console.error("Error details:", error); // ⚡️ LOG DEL ERROR COMPLETO

          }
        }
      }
    }

    // Actualiza el estado solo si hay cambios
    setOwnedTraitURIs((prevUris) => {
      const newUris = { ...prevUris, ...uris };
      if (JSON.stringify(newUris) !== JSON.stringify(prevUris)) {
        return newUris;
      }
      return prevUris;
    });
  };

 useEffect(() => {
    fetchOwnedTraitsMetadata(); // Llama a la función al montar el componente
  }, [ownedTraits, traitsContract]);


   

  
return (
  <div>
    {/* Solo mostrar el slot seleccionado */}
    <div key={selectedSlot} className="mb-4">
    <h3>Slot: {SLOT_TO_TRAIT_TYPE[selectedSlot]}</h3>

  {/* Verificamos que haya datos para este slot, aunque sea un array vacío */}
  {ownedTraits[selectedSlot] === undefined ? (
    <p>Loading...</p>
  ) : ownedTraits[selectedSlot].length > 0 ? (
    <div className="grid grid-cols-3 gap-4 mt-4">
      {ownedTraits[selectedSlot].map((ownedTrait) => (
        <div key={ownedTrait.id}>
          <TraitsCard
            tokenId={tokenId}
            traitId={ownedTrait.id}
            ownedTraits={ownedTrait}
            contract={traitsContract}
            baseContract={String(baseContract)}
            account={account?.address || ""}
            onClickEquip={onClickEquip}
            onClickUnequip={onClickUnequip}
            selectedTraits={selectedTraits}
            setSelectedTraits={setSelectedTraits}
            equippedTraits={equippedTraits}
            selectedSlot={selectedSlot}
            tempSelectedTrait={tempSelectedTrait}
            setTempSelectedTrait={setTempSelectedTrait}
          />
        </div>
      ))}
    </div>
  ) : (
    <p>No traits found for this slot.</p>
  )}
</div>


<button
  onClick={() => {
    const slot = Number(Object.keys(tempSelectedTrait)[0]);
    const traitId = tempSelectedTrait[slot];
    if (traitId === null || traitId === undefined) return;

    // 👉 Añadir a toEquip
    setToEquip((prev) => [...prev, traitId]);

    // 👉 Añadir a selectedTraits para que se vea en el canvas
    setSelectedTraits((prev) => ({
      ...prev,
      [slot]: traitId,
    }));

    // 👉 Limpiar selección temporal
    setTempSelectedTrait({});

    onClose();
  }}
  className="bg-white text-black py-2 px-4 rounded-lg mt-4 cursor-pointer"
  disabled={Object.keys(tempSelectedTrait).length === 0}
>
  Equip Selected Trait
</button>


          <button
      onClick={fetchTraits}
      className="bg-[#000000] text-white py-2 px-4 rounded-lg mt-4 ml-4 self-center cursor-pointer"
    >
      🔄 Refetch Parts
    </button>
  </div>
);

  };
  