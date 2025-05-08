"use client"

import { getContract, NFT, prepareContractCall, readContract } from "thirdweb";
import { MediaRenderer, useActiveAccount, useReadContract, useSendTransaction, ConnectButton } from "thirdweb/react";
import { BASE_CONTRACT, TRAITS_CONTRACT } from "../../../constants/addresses";
import { chain } from "../chain";
import { client } from "../client";
import { getNFTs, ownerOf, totalSupply } from "thirdweb/extensions/erc721";
import NavBar from "../components/NavBar";
import { useEffect, useMemo, useState } from "react";
import { OwnedSimians } from "../components/OwnedSimians";
import { OwnedTraits } from "../components/OwnedTraits";
import NFTCanvas from "../components/NFTCanvas";
import { createWallet } from "thirdweb/wallets";
import router from "next/router";
import Image from 'next/image';
import { getOwnedNFTs } from "thirdweb/extensions/erc1155";


const Canvas = () => {
    const account = useActiveAccount();
    const wallets = [
      createWallet("io.metamask"),
      createWallet("com.coinbase.wallet"),
      createWallet("me.rainbow"),
      createWallet("io.rabby"),
      createWallet("app.phantom"),
  ];

    const baseContract = getContract({
        client: client,
        chain: chain,
        address: BASE_CONTRACT.address,
    });

    const traitsContract = getContract({
        client: client,
        chain: chain,
        address: TRAITS_CONTRACT.address,
    });

    const [selectedTraits, setSelectedTraits] = useState<Record<number, number>>({});
    
  //--------------------OWNED BASE NFTs---------------------------------------------------------


     // Obtener robots que posee la cuenta conectada
     const [ownedBase, setOwnedBase] = useState<NFT[]>([]);
     const [isLoadingBase, setIsLoadingBase] = useState(false); // Estado de carga
     const [selectedTokenId, setSelectedTokenId] = useState<number>(0);

     const getOwnedBase = async () => {
        setIsLoadingBase(true); // Activar loading antes de la consulta
         let ownedBase: NFT[] = [];
         
         try {
             const totalNFTSupply = await totalSupply({ contract: baseContract });
 
             const nfts = await getNFTs({
                 contract: baseContract,
                 start: 0,
                 count: parseInt(totalNFTSupply.toString()),
             });
 
             for (let nft of nfts) {
                 const owner = await ownerOf({
                     contract: baseContract,
                     tokenId: nft.id,
                 });
                 if (owner === account?.address) {
                    ownedBase.push(nft);
                 }
             }
 
             setOwnedBase(ownedBase);
         } catch (error) {
             console.error("Error fetching NFTs:", error);
         }
 
         setIsLoadingBase(false); // Desactivar loading después de la consulta
     };

     useEffect(() => {
        if (account) {
            getOwnedBase();
        }
    }, [account]);

// Establecer el primer tokenId disponible automáticamente
useEffect(() => {
  if (ownedBase.length > 0) {
    const firstId = Number(ownedBase[0].id); // Asegurar que accede a la propiedad id
    if (!isNaN(firstId)) {
      setSelectedTokenId(firstId);
    }
  }
}, [ownedBase]);

useEffect(() => {
  // Al cambiar de NFT base seleccionado:
  setToEquip([]);
  setToUnequip([]);
  setSelectedTraits({}); // Si estás usando un trait seleccionado en modal
}, [selectedTokenId]);



      //------------TRAITTYPES & SLOTS-----------------------------------------------------------------

    const traitTypes = useMemo(() => ["Background", "Back", "RightArm", "Body", "LeftArm", "RightLeg", "LeftLeg", "Head", "Accessories"], []);

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
           
      const SLOT_TO_TRAIT_TYPE: Record<number, string> = Object.entries(TRAIT_TYPE_TO_SLOT).reduce(
        (acc, [traitType, slot]) => {
          acc[slot] = traitType;
          return acc;
        },
        {} as Record<number, string>
      );
      
      const [selectedSlot, setSelectedSlot] = useState<number | null>(null);


       //------------GET EQUIPPED TRAITS-----------------------------------------------------------------

       const [equippedTraits, setEquippedTraits] = useState<{ [key: number]: number | null }>({});

  // Obtener los tipos de traits equipados
  const { data: types } = useReadContract({
    contract: baseContract,
    method: "function getEquippedTraitTypes(uint256 tokenId) view returns (uint8[])",
    params: [BigInt(selectedTokenId)], 
  });

  // Obtener los traits equipados
  const { data: equipped } = useReadContract({
    contract: baseContract,
    method: "function getEquippedTraits(uint256 tokenId) view returns (uint256[])",
    params: [BigInt(selectedTokenId)],
  });

    
  useEffect(() => {
    if (types && equipped) {
      const parsedTypes = Array.isArray(types) ? types.map(Number) : [];
      const parsedEquipped = Array.isArray(equipped) ? equipped.map(Number) : [];
  
      //cambiar "9" por cantidad de tipos en contrato
      const traitData: { [key: number]: number | null } = {};
        for (let i = 1; i <= 9; i++) { 
          traitData[i] = null;
        }
  
        parsedEquipped.forEach((traitId, index) => {
          const type = parsedTypes[index];
          if (type !== undefined && type !== null) {
            traitData[type] = traitId;
          }
        });
  
        setEquippedTraits(traitData);
    }
  }, [types, equipped, traitTypes]);

      

    //------------GET OWNED TRAITS-----------------------------------------------------------------
    

    


  //---------------URIs-----------------------------

  // para la portada del slot

  const [ownedTraitURIsById, setOwnedTraitURIsById] = useState<{ [traitId: number]: string | undefined }>({});
  useEffect(() => {
    const fetchOwnedTraitURIsById = async () => {
      const uris: { [traitId: number]: string | undefined } = {};
  
      for (const type of Object.keys(selectedTraits)) {
        const traitId = selectedTraits[parseInt(type)];
        if (traitId !== null && !uris[traitId]) {
          const uri = await readContract({
            contract: traitsContract,
            method: "function uri(uint256 tokenId) view returns (string)",
            params: [BigInt(traitId)],
          });
  
          const metadataUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
          const metadataResponse = await fetch(metadataUrl);
          const metadata = await metadataResponse.json();
          const imageUrl = metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || null;
  
          uris[traitId] = imageUrl;
        }
      }
  
      setOwnedTraitURIsById((prev) => ({ ...prev, ...uris }));
    };
  
    fetchOwnedTraitURIsById();
  }, [selectedTraits]);
  


  const [traitURIsById, setTraitURIsById] = useState<{ [traitId: number]: string | undefined }>({});
useEffect(() => {
  const fetchTraitURIsById = async () => {
    const uris: { [traitId: number]: string | undefined } = {};

    for (const type of Object.keys(equippedTraits)) {
      const traitId = equippedTraits[parseInt(type)];
      if (traitId !== null && !uris[traitId]) {
        const uri = await readContract({
          contract: traitsContract,
          method: "function uri(uint256 tokenId) view returns (string)",
          params: [BigInt(traitId)],
        });

        const metadataUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
        const metadataResponse = await fetch(metadataUrl);
        const metadata = await metadataResponse.json();
        const imageUrl = metadata.image?.replace("ipfs://", "https://ipfs.io/ipfs/") || null;

        uris[traitId] = imageUrl;
      }
    }

    setTraitURIsById((prev) => ({ ...prev, ...uris }));
  };

  fetchTraitURIsById();
}, [equippedTraits]);


  // owned traits > Defined here, fetched en OwnedTraits

  const [ownedTraitURIs, setOwnedTraitURIs] = useState<{ [key: number]: string | undefined }>({});

  // equipped traits

  const [traitURIs, setTraitURIs] = useState<{ [key: number]: string | undefined }>({});


    useEffect(() => {
      const fetchMetadata = async () => {
        if (!traitsContract || Object.keys(equippedTraits).length === 0) return;
    
        const uris: { [key: number]: string | undefined } = {};
    
        for (const type of Object.keys(equippedTraits)) {
          const traitId = equippedTraits[parseInt(type)];
          if (traitId !== null) {
            // Verifica si ya se han obtenido los URIs para este trait
            if (!uris[parseInt(type)]) {
              // Obtener URI del trait
              const uri = await readContract({
                contract: traitsContract,
                method: "function uri(uint256 tokenId) view returns (string)",
                params: [BigInt(traitId)],
              });
    
              // Buscar metadata JSON y extraer la URL de la imagen
              const metadataUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
              const metadataResponse = await fetch(metadataUrl);
              const metadata = await metadataResponse.json();
              const imageUrl = metadata.image ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/") : null;
    
              uris[parseInt(type)] = imageUrl;
            }
          }
        }
    
        // Solo actualiza el estado si hay cambios en uris
        setTraitURIs((prevUris) => {
          const newUris = { ...prevUris, ...uris };
          // Compara si hay cambios en los URIs antes de actualizar el estado
          if (JSON.stringify(newUris) !== JSON.stringify(prevUris)) {
            return newUris;
          }
          return prevUris;
        });
      };
    
      fetchMetadata();
    }, [equippedTraits, traitsContract]); 


  


  //---------------EQUIP/UNEQUIP--------------------------------------------------------------

  const [toEquip, setToEquip] = useState<number[]>([]);
  const [toUnequip, setToUnequip] = useState<number[]>([]);

  // Resetear al cambiar el token base seleccionado
useEffect(() => {
  setToEquip([]);
  setToUnequip([]);
}, [selectedTokenId]);

  const onClickEquip = (traitId: number) => {
    setToEquip((prev) => {
      if (prev.includes(traitId)) {
        return prev.filter((id) => id !== traitId); // Deselect
      } else {
        return [...prev, traitId]; // Select
      }
    });
  };

  const onClickCancelEquip = (traitId: number) => {
    setToEquip((prev) => prev.filter((id) => id !== traitId));
    setSelectedTraits((prev) => {
      const newSelected = { ...prev };
      // Elimina el traitId de cualquier slot donde esté
      for (const slot in newSelected) {
        if (newSelected[slot] === traitId) {
          delete newSelected[slot];
        }
      }
      return newSelected;
    });
  };
 
  
  const onClickUnequip = (traitId: number) => {
    setToUnequip((prev) => {
      if (prev.includes(traitId)) {
        return prev.filter((id) => id !== traitId); // Deselect
      } else {
        return [...prev, traitId]; // Select
      }
    });
  };

  const onClickCancelUnequip = (traitId: number) => {
    setToUnequip((prev) => prev.filter((id) => id !== traitId));
  };
  

  //---------------CANVAS--------------------------------------------------------------


    // Base

    const [ baseImage, setBaseImage ] = useState<string>("");

    useEffect(() => {
      // Simulamos la carga de los NFT base
      const nft = ownedBase.find((nft) => Number(nft.id) === selectedTokenId);
      if (nft && nft.metadata.image) {
        setBaseImage(nft.metadata.image);
            console.log('Base image:', nft.metadata.image); // Verifica que la URL esté correcta

      }
    }, [selectedTokenId, ownedBase]);


    
  //------------DRIVER-----------------------------------------------------------------

    // Driver Image

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUploaded, setImageUploaded] = useState<boolean>(false);  // Controlar cuando la imagen está lista para ser renderizada
    const [userImageIPFS, setUserImageIPFS] = useState<string | null>(null);
    const [driverCID, setDriverCID] = useState<string | null>(null);

    


  
    // Validar si hay un body equipado/seleccionado
    const isBodyEquipped = equippedTraits[4] !== null;
    const isBodySelected = selectedTraits[4] != null;



    // Función para manejar la subida de la imagen
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Verificar si el body está equipado antes de permitir la subida
        if (!canUploadDriverImage) {
        console.warn("⚠ There's no body equipped. You can't set a driver!");
    return;
     }

    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
    setImageFile(file);
    setImageUploaded(false);  // Resetear el estado de "upload" hasta que el usuario lo confirme
     }
    };

    // Función para confirmar el upload de la imagen
    const handleUpload = () => {
    // Verificar si el body está equipado antes de permitir la confirmación de la subida
        if (!canUploadDriverImage) {
          console.warn("⚠ There's no body equipped. You can't set a driver!");
          return;
  }

  if (imageFile) {
    setImageUploaded(true);  // Confirmamos que la imagen fue subida
  }
};

const uploadedImagePreview = imageFile ? URL.createObjectURL(imageFile) : null;

const uploadFileToIPFS = async (file: File): Promise<string> => {
  // Verificar si el body está equipado antes de permitir la subida a IPFS
  if (!canUploadDriverImage) {
    console.warn("⚠ No hay un 'body' equipado. No se puede subir la imagen al IPFS.");
    return "";  // Devolver una cadena vacía si no se puede subir
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploadDriver", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log("Image uploaded to IPFS:", result.ipfsHash);
      return result.ipfsHash; // Devuelve el CID
    } else {
      throw new Error(`Error uploading file to IPFS: ${result.message}`);
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};


    // Driver Name

const selectedNFT = ownedBase.find(nft => Number(nft.id) === selectedTokenId);

const [driverName, setDriverName] = useState(""); // Valor por defecto

useEffect(() => {
  if (selectedNFT && selectedNFT.metadata && Array.isArray(selectedNFT.metadata.attributes)) {
    const driverAttr = selectedNFT.metadata.attributes.find(attr => attr.trait_type === "Driver");
    if (driverAttr && typeof driverAttr.value === "string") {
      setDriverName(driverAttr.value);
    } else {
      setDriverName("None");
    }
  } else {
    setDriverName("None");
  }
}, [selectedTokenId, ownedBase]);


  //------------MODAL-----------------------------------------------------------------


const [isModalOpen, setIsModalOpen] = useState(false);
const openModal = (slot: number) => {
  setSelectedSlot(slot);  // Establecer el slot seleccionado
  setIsModalOpen(true);    // Abrir la modal
};
const closeModal = () => {
  setSelectedSlot(null);  // Restablecer el slot seleccionado al cerrar
  setIsModalOpen(false);  // Cerrar la modal
};


const [tempSelectedTrait, setTempSelectedTrait] = useState<Record<number, number>>({});





//----------MERGE EQUIPPED+SELECTED

const effectiveEquippedTraits: Record<number, number | null> = {
  ...equippedTraits,
  ...selectedTraits,
};

Object.entries(effectiveEquippedTraits).forEach(([slot, traitId]) => {
  if (traitId !== null && toUnequip.includes(traitId)) {
    effectiveEquippedTraits[Number(slot)] = null;
  }
});

/*anterior:

const merged = { ...equippedTraits, ...selectedTraits };

// Aplica el filtro limpio:
const effectiveEquippedTraits: Record<number, number | null> = {};

for (const [slot, traitId] of Object.entries(merged)) {
  const id = Number(traitId);
  if (id > 0 && !toUnequip.includes(id)) {
    effectiveEquippedTraits[Number(slot)] = id;
  } else {
    effectiveEquippedTraits[Number(slot)] = null;
  }
}
*/

const canUploadDriverImage = effectiveEquippedTraits[4] !== null;




  return (
<section className="w-full min-h-screen bg-[#0d0d0d] text-[#e5e5e5] font-lexend">
<NavBar />
  
    {/* If account not connected */}
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
    ) : ownedBase.length === 0 ? (
      /* If account connected but no ownedBase */
      <div className="flex justify-center items-center h-screen">
        <button
          onClick={() => router.push("/Mint")}
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
        >
          Mint your first Robot
        </button>
      </div>
    ) : (

      <div className="flex flex-col justify-center items-center h-full p-10 space-y-4">

        {/* Seccion superior - Owned Base */}
      <div className="bg-gradient-to-br from-[#1e2326] via-[#352e33] to-[#111111] w-full p-8 border-solid border-4 border-black rounded-lg">
        <div className="flex flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-4">Your Robots</h2>
        <button
                onClick={getOwnedBase}
                className="bg-[#000000] text-white py-2 px-4 rounded-lg self-center cursor-pointer"
              >
                  🔄 Refetch NFTs
                </button>    
        </div>
        
        <div className="flex flex-col md:flex-row lg:flex-row flex-wrap gap-5 items-center justify-start">
          {isLoadingBase ? (
            <p className="text-gray-500 font-bold animate-pulse">Loading NFTs...</p>
          ) : (
            ownedBase.map((nft) => (
              <><div
                key={nft.id}
                className={`cursor-pointer bg-black border-2 p-2 rounded-xl ${selectedTokenId === Number(nft.id) ? "border-blue-500" : "border-gray-300"}`}
                onClick={() => setSelectedTokenId(Number(nft.id))}
              >
                <OwnedSimians nft={nft} driverName={driverName} />
              </div>
             </>
              
            ))
          )}
        </div>
        </div>

        {/* Seccion inferior */}

        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 overflow-hidden">
          
          {/* Left Column - canvas */}

          <div className="rounded-lg">
          {selectedTokenId !== null && baseImage && (
          <NFTCanvas
            ownedMechas={ownedBase}
            selectedTokenId={selectedTokenId}
            traitTypes={traitTypes}
            baseContract={baseContract}
            traitsContract={traitsContract}
            refetch={getOwnedBase}
            userImage={userImageIPFS ?? imageUploaded ? imageFile : null}
            driverName={driverName}
            driverCID={driverCID}
            isBodyEquipped={isBodyEquipped}
            canUploadDriverImage={canUploadDriverImage}
            selectedTraits={selectedTraits}
            setSelectedTraits={setSelectedTraits}
            effectiveEquippedTraits={effectiveEquippedTraits}
            toEquip={toEquip}
            toUnequip={toUnequip}
            setImageFile={setImageFile}
            setImageUploaded={setImageUploaded}
            setDriverCID={setDriverCID}
            setUserImageIPFS={setUserImageIPFS}
            />
        )}
            </div>

            {/* Right column - owned parts */}
            <div className="flex flex-col justify-center items-center p-4 rounded-lg">

            {/* Mostrar Traits Equipados */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 items-center justify-center md:justify-start px-10">
          
          {Object.keys(effectiveEquippedTraits).map((type) => {
    const slotType = parseInt(type);
    const traitId = effectiveEquippedTraits[slotType];
  
    const selectedTraitId = toEquip.includes(selectedTraits[slotType])
      ? selectedTraits[slotType]
      : undefined;
  
    const equippedTraitId = equippedTraits[slotType]; // lo que está realmente equipado
    const isEquipped = traitId === equippedTraitId && traitId !== null;
    const isSelectedToEquip = traitId !== null && toEquip.includes(traitId);
    const isSelectedToUnequip = equippedTraitId !== null && toUnequip.includes(equippedTraitId);
    const hasEquippedTrait = equippedTraitId !== null;
  
    const hasTrait = traitId !== null;
  
    // Determinar si es necesario mostrar el placeholder
    const showPlaceholder = isSelectedToUnequip || (equippedTraitId === null && !selectedTraitId);
  
    // Determinar la URL de la imagen
    const imageUrl =
    selectedTraitId !== undefined
      ? ownedTraitURIsById[selectedTraitId]
      : equippedTraitId !== null && !showPlaceholder
      ? traitURIsById[equippedTraitId]
      : null;
  
    return (
      <div key={slotType} className="flex flex-col justify-center items-center">
      <h3>{SLOT_TO_TRAIT_TYPE[slotType]}</h3>
      <p>
          {selectedTraitId !== undefined
            ? `Part ID: ${selectedTraitId}`
            : equippedTraitId !== null
            ? `Part ID: ${equippedTraitId}`
            : "None"}
        </p>
  
        {imageUrl ? (
          <MediaRenderer
            client={client}
            src={imageUrl}
            className="w-[100px]"
            alt={`Trait for slot ${slotType}`}
          />
        ) : (
          showPlaceholder && (
            <Image
              src="/placeholder.jpg"
              alt="Placeholder"
              width={100}
              height={100}
              priority
            />
          )
          )}
  
          {/* Botón cancelar equip */}
          {isSelectedToEquip && (
            <button
              onClick={() => onClickCancelEquip(traitId)}
              className="cursor-pointer mt-4 font-lexend flex items-center justify-center w-full px-6 py-2.5 text-center text-white duration-200 bg-black border-2 border-black rounded-lg inline-flex hover:bg-transparent hover:border-white focus:outline-none focus-visible:outline-black text-sm focus-visible:ring-black"
            >
              Cancel Equip {traitId}
            </button>
          )}
  
          {/* Botón cancelar unequip */}
          {hasEquippedTrait && isSelectedToUnequip && !isSelectedToEquip &&(
    <button
      onClick={() => onClickCancelUnequip(equippedTraitId)}
      className="cursor-pointer mt-4 font-lexend flex items-center justify-center w-full px-6 py-2.5 text-center text-white duration-200 bg-black border-2 border-black rounded-lg inline-flex hover:bg-transparent hover:border-white focus:outline-none focus-visible:outline-black text-sm focus-visible:ring-black"
    >
      Cancel Unequip {equippedTraitId}
    </button>
  )}
  
          {/* Botón unequip normal */}
          {isEquipped && !isSelectedToUnequip && !isSelectedToEquip && (
            <button
              onClick={() => onClickUnequip(traitId)}
              className="cursor-pointer mt-4 font-lexend flex items-center justify-center w-full px-6 py-2.5 text-center text-white duration-200 bg-black border-2 border-black rounded-lg inline-flex hover:bg-transparent hover:border-white focus:outline-none focus-visible:outline-black text-sm focus-visible:ring-black"
            >
              Unequip Part {traitId}
            </button>
          )}
  
          {/* Botón de equipar (si no está equipado y no está seleccionado) */}
          {!isEquipped && !isSelectedToEquip && (
            <button
              onClick={() => openModal(slotType)}
              className="mt-2 font-lexend flex items-center justify-center w-full px-6 py-2.5 text-center text-white duration-200 bg-black border-2 border-black rounded-lg inline-flex hover:bg-transparent hover:border-white focus:outline-none text-sm cursor-pointer"
            >
              Equip Part
            </button>
                  )}
  
  
                 
      {/*Modal*/}
    {isModalOpen && selectedSlot !== null && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
  <div className="bg-white p-6 rounded-lg max-h-[90vh] w-full max-w-2xl overflow-y-auto text-black">
          <OwnedTraits
            tokenId={selectedTokenId}
            traitTypes={Object.keys(equippedTraits)}
            selectedSlot={selectedSlot}
            onClose={closeModal}
            equippedTraits={equippedTraits}
            selectedTraits={selectedTraits}
            setSelectedTraits={setSelectedTraits}
            onClickEquip={onClickEquip}
            onClickUnequip={onClickUnequip}
            tempSelectedTrait={tempSelectedTrait}
            setTempSelectedTrait={setTempSelectedTrait}
            toEquip={toEquip}
            setToEquip={setToEquip}
            toUnequip={toUnequip}
            setToUnequip={setToUnequip}
            ownedTraitURIs={ownedTraitURIs}
            setOwnedTraitURIs={setOwnedTraitURIs}
          />
  
          <button onClick={closeModal} className="cursor-pointer mt-4">Close</button>
        </div>
      </div>
    )}
  
  
  
                </div>
              );
            })}
          </div>
  
            {/* UPLOAD DRIVER IMAGE */}
  
    <div>
  
  
    
  
  
  <div className="border-solid border-4 border-[#ff6700] shadow-lg shadow-amber-400/50 p-4 mt-8 font-lexend rounded-lg w-full">
    <p className="mb-4 font-bold">Avatar Driver System:</p>

    <div className="flex flex-row gap-4 items-center mb-4">
            <label className="block font-medium">Driver name:</label>
      <input
        type="text"
        className="border p-2 rounded mb-4"
        value={driverName}
        onChange={(e) => setDriverName(e.target.value)}
        placeholder="e.g. Vitalik"
      />
</div>
    
    {/* Validar si hay un body equipado */}
    {canUploadDriverImage ? (
    <>
<p>Upload a PFP as a Driver:</p>
      <input 
        type="file" 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="mb-4 m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid border-secondary-500 bg-transparent bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-surface transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:me-3 file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-e file:border-solid file:border-inherit file:bg-transparent file:px-3  file:py-[0.32rem] file:text-surface focus:border-primary focus:text-gray-700 focus:shadow-inset focus:outline-none dark:border-white/70 dark:text-white  file:dark:text-white"
        />

  
<button
        onClick={async () => {
          if (imageFile) {
            try {
              const cid = await uploadFileToIPFS(imageFile);
              console.log("Driver image CID:", cid);
              setUserImageIPFS(`https://ipfs.io/ipfs/${cid}`);
              setDriverCID(cid);
            } catch (error) {
              console.error("Error uploading image to IPFS:", error);
            }
          } else {
            alert("Please select an image first.");
          }
        }}
        className="my-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition cursor-pointer">
        Set Driver
      </button>
    </>
  ) : (
    <p className="text-red-500">Equip a body to set a Driver</p>
  )}
  </div>
  
  
    </div>
            
            </div>


        </div>



      </div>

    )}
  </section>
  
  
  );

}; 


  export default Canvas;


