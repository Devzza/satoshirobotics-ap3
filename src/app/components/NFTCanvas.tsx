import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { getContract, NFT, prepareContractCall, readContract } from "thirdweb";
import { MediaRenderer, useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react';
import { BASE_CONTRACT, TRAITS_CONTRACT } from '../../../constants/addresses';
import { chain } from '../chain';
import { client } from '../client';

interface Trait {
  layer_type: string;
  name: string;
}

interface Attribute {
  trait_type: string;
  value: string;
}

interface Metadata {
  name: string;
  description: string;
  image: string;
  canvas: string;
  driver: string;
  edition: number;
  date: number;
  attributes: Attribute[];
}

interface NFTCanvasProps {
  ownedMechas: NFT[]; // los NFT base que posee la cuenta conectada
  selectedTokenId: number | null; // el NFT base 
  traitTypes: string[]; // Los traitTypes, definidos en metadata.layer_types como "Background" o "Clothing"
  baseContract: any; // El contrato de los simians
  traitsContract: any; // El contrato de los traits
  refetch: () => Promise<void>;
  userImage: File | string | null;
  driverName: string;
  driverCID: string | null;
  isBodyEquipped: boolean;
  canUploadDriverImage: boolean
  selectedTraits: Record<number, number>;
  setSelectedTraits: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  effectiveEquippedTraits: Record<number, number | null>
  toEquip: number[];
  toUnequip: number[];
  setToEquip: React.Dispatch<React.SetStateAction<number[]>>
  setToUnequip: React.Dispatch<React.SetStateAction<number[]>>
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>
  setImageUploaded: React.Dispatch<React.SetStateAction<boolean>>
  setDriverCID: React.Dispatch<React.SetStateAction<string | null>>
  setUserImageIPFS: React.Dispatch<React.SetStateAction<string | null>>
}

// Función para convertir URL IPFS a HTTP
const getIpfsUrl = (ipfsUrl: string) => {
  if (ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return ipfsUrl;
};

const NFTCanvas: React.FC<NFTCanvasProps> = ({
  ownedMechas,
  selectedTokenId,
  traitTypes,
  baseContract,
  traitsContract,
  refetch,
  userImage,
  driverName,
  driverCID,
  isBodyEquipped,
  selectedTraits,
  setSelectedTraits,
  effectiveEquippedTraits,
  toEquip,
  toUnequip,
  setToEquip,
  setToUnequip,
  canUploadDriverImage,
  setImageFile,
  setImageUploaded,
  setDriverCID,
  setUserImageIPFS,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseImage, setBaseImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [equippedTraits, setEquippedTraits] = useState<Record<number, number | null>>({}); // Definir con índice numérico
  const [traitURIs, setTraitURIs] = useState<{ [key: number]: string | undefined }>({}); // Estado local para traitURIs
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [traitMetadata, setTraitMetadata] = useState<{ [key: number]: any }>({});
  const [selectedNFTMetadata, setSelectedNFTMetadata] = useState<Record<string, any> | null>(null);
  const [newMetadataCid, setNewMetadataCid] = useState<string | null>(null);
  const [localTraitMetadata, setLocalTraitMetadata] = useState<{ [key: number]: {
    name: string; trait_type: string; value: string 
} }>({});
const [isUploading, setIsUploading] = useState(false); 
const [isSettingURI, setIsSettingURI] = useState(false);

const account = useActiveAccount();


const mechasContract = getContract({
  client: client,
  chain: chain,
  address: BASE_CONTRACT.address,
});


const [hasTraits, setHasTraits] = useState(false);

function serializeTraits(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}


useEffect(() => {
  if (selectedTokenId === null) return;

  const nft = ownedMechas.find((nft) => BigInt(nft.id) === BigInt(selectedTokenId));
  if (!nft || !nft.metadata) return;

  const metadata = nft.metadata;

  const canvasUrl = typeof metadata.canvas === "string" ? getIpfsUrl(metadata.canvas) : null;
  const baseUrl = typeof metadata.base === "string" ? getIpfsUrl(metadata.base) : null;

  const hasEquipped = Object.values(equippedTraits).some((v) => v !== null);
  const hasSelected = Object.keys(selectedTraits).length > 0;

  const traitsExist = hasEquipped || hasSelected;
  setHasTraits(traitsExist); // 👉 Guardamos el valor en el estado

  const imageToUse = traitsExist ? canvasUrl : baseUrl;

  if (imageToUse) {
    setBaseImage(imageToUse);
    console.log("✅ Dibujando:", imageToUse);
  } else {
    console.warn("⚠️ No se encontró una imagen válida para el token base.");
  }
}, [
  selectedTokenId,
  ownedMechas,
  JSON.stringify(equippedTraits),
  JSON.stringify(serializeTraits(selectedTraits)), 
]);


  


    // Resetear los estados al cambiar selectedTokenId
    useEffect(() => {
      setSelectedTraits({});
      setEquippedTraits({});
      setTraitURIs({});
      setIpfsHash(null); // Resetear el hash de IPFS
    }, [selectedTokenId]);

     // Obtener la metadata del selectedTokenId
  const { data: tokenUri } = useReadContract({
    contract: baseContract,
    method: "function tokenURI(uint256 tokenId) view returns (string)",
    params: [BigInt(selectedTokenId ?? 0)],
  });

  // Obtener los tipos de traits equipados
  const { data: types } = useReadContract({
    contract: baseContract,
    method: "function getEquippedTraitTypes(uint256 tokenId) view returns (uint8[])",
    params: [BigInt(selectedTokenId ?? 0)], 
  });

  // Obtener los traits equipados
  const { data: equipped } = useReadContract({
    contract: baseContract,
    method: "function getEquippedTraits(uint256 tokenId) view returns (uint256[])",
    params: [BigInt(selectedTokenId ?? 0)],
  });

    
  useEffect(() => {
    if (types && equipped) {
      const parsedTypes = Array.isArray(types) ? types.map(Number) : [];
      const parsedEquipped = Array.isArray(equipped) ? equipped.map(Number) : [];
  
      const traitData: { [key: number]: number | null } = {};
      for (let i = 1; i <= 9; i++) {
        traitData[i] = null;
      }
  
      // Asignamos los equippedTraits originales
      parsedEquipped.forEach((traitId, index) => {
        const type = parsedTypes[index];
        if (type !== undefined && type !== null) {
          traitData[type] = traitId;
        }
      });
  
      // Sobrescribimos con los selectedTraits si hay alguno
      if (selectedTraits) {
        Object.entries(selectedTraits).forEach(([slot, traitId]) => {
          const slotNumber = Number(slot);
          if (traitId !== undefined && traitId !== null) {
            traitData[slotNumber] = Number(traitId);
          }
        });
      }
  
      // 🔥 Eliminamos los traitIds que están en toUnequip
      if (toUnequip && toUnequip.length > 0) {
        for (const slot in traitData) {
          const traitId = traitData[slot];
          if (traitId !== null && toUnequip.includes(traitId)) {
            traitData[slot] = null;
          }
        }
      }
  
      setEquippedTraits(traitData);
  
      // console.log("Final equippedTraits (con selectedTraits y filtrado toUnequip):", traitData);
    }
  }, [types, equipped, selectedTraits, toUnequip]);
  



  useEffect(() => {
    const fetchMetadata = async () => {
      if (!traitsContract || (Object.keys(equippedTraits).length === 0 && Object.keys(selectedTraits).length === 0)) return;
  
      const uris: { [key: number]: string | undefined } = {};
  
      // Unificar equippedTraits y selectedTraits
      const allTraits: { [key: string]: number | null } = { ...equippedTraits, ...selectedTraits };
  
      for (const type of Object.keys(allTraits)) {
        const traitId = allTraits[parseInt(type)];
        if (traitId !== null) {
          if (!uris[traitId]) {
            const uri = await readContract({
              contract: traitsContract,
              method: "function uri(uint256 tokenId) view returns (string)",
              params: [BigInt(traitId)],
            });
            const metadataUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
            const metadataResponse = await fetch(metadataUrl);
            const metadata = await metadataResponse.json();
            uris[traitId] = metadata.canvas ? metadata.canvas.replace("ipfs://", "https://ipfs.io/ipfs/") : null;
          }
        }
      }
  
      setTraitURIs((prevUris) => {
        const newUris = { ...prevUris, ...uris };
        if (JSON.stringify(newUris) !== JSON.stringify(prevUris)) {
          return newUris;
        }
        return prevUris;
      });
    };
  
    fetchMetadata();
  }, [equippedTraits, selectedTraits, traitsContract]);
  



  const fetchTraitMetadata = useCallback(async () => {
    if (!traitsContract || (Object.keys(equippedTraits).length === 0 && Object.keys(selectedTraits).length === 0)) return;
    
    const metadata: Record<number, any> = {}; // Aseguramos que metadata acepta claves numéricas
  
    // Unificamos los traits, asegurándonos que ambos son del mismo tipo
    const allTraits = { ...equippedTraits, ...selectedTraits };
  
    // Iteramos sobre las claves de allTraits
    for (const type of Object.keys(allTraits)) {
      // Convertimos 'type' a número, ya que Object.keys devuelve strings
      const traitId = allTraits[parseInt(type)]; 
  
      // Verificamos que traitId no sea null ni undefined
      if (traitId !== null && traitId !== undefined) {
        try {
          // Obtenemos la URI de la metadata del trait
          const uri = await readContract({
            contract: traitsContract,
            method: "function uri(uint256 tokenId) view returns (string)",
            params: [BigInt(traitId)],
          });
          
          // Convertimos la URI de IPFS a la URL correspondiente
          const metadataUrl = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
          
          // Hacemos fetch de la metadata
          const response = await fetch(metadataUrl);
          metadata[traitId] = await response.json(); // Almacenamos la metadata usando traitId
        } catch (error) {
          // console.error("Error fetching metadata for trait:", traitId, error);
        }
      }
    }
  
    // Actualizamos el estado con los metadatos de los traits
    setLocalTraitMetadata(metadata);
  
    // 🛠️ Debug: Ver los valores finales
    //console.log("🔹 JSON de los traits (equipados y seleccionados):", metadata);
  }, [equippedTraits, selectedTraits, traitsContract, readContract]);
  
  // UseEffect para depurar la metadata local
  useEffect(() => {
    //console.log("🛠 localTraitMetadata actualizado:", localTraitMetadata);
  }, [localTraitMetadata]);
  
  // UseEffect para ejecutar la función de obtención de metadata cuando cambian los traits
  useEffect(() => {
    fetchTraitMetadata(); // Llama a la función cuando cambian los traits
  }, [equippedTraits, selectedTraits, traitsContract, fetchTraitMetadata]);
  



  // Conocer toda la metadata del NFT base para la actualización


  useEffect(() => {
    const fetchSelectedNFTMetadata = async () => {
      if (!tokenUri) return;

      const metadataUrl = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
      const response = await fetch(metadataUrl);
      const jsonMetadata = await response.json();
      setSelectedNFTMetadata(jsonMetadata);

      // 🛠️ Debug: Ver JSON del selectedTokenId en consola
    //  console.log("🔹 JSON del selectedTokenId:", jsonMetadata);
    };

    fetchSelectedNFTMetadata();
  }, [tokenUri]);

  const updatedMetadata = selectedNFTMetadata ? { ...selectedNFTMetadata } : {};

  function parseIpfsUrl(ipfsUrl: string): string {
    if (ipfsUrl.startsWith("ipfs://")) {
      return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return ipfsUrl;
  }


  const [userImageURL, setUserImageURL] = useState<string | null>(null);

 // Convertir la imagen subida por el usuario en una URL
 useEffect(() => {
  if (userImage instanceof File) {
    const objectURL = URL.createObjectURL(userImage);
    setUserImageURL(objectURL);

    return () => URL.revokeObjectURL(objectURL);
  } else if (typeof userImage === "string") {
    // Si ya es una URL IPFS u otra string, la usamos directamente
    setUserImageURL(userImage);
  } else {
    setUserImageURL(null);
  }
}, [userImage]);
      



useEffect(() => {
  drawNFTOnCanvas();
}, [
  baseImage,
  equippedTraits,
  selectedTraits,
  traitURIs,
  traitTypes,
  userImageURL,
  selectedNFTMetadata
]);



const drawNFTOnCanvas = async () => {
  setLoading(true);
  const canvas = canvasRef.current;
  if (!canvas) {
    console.error('Canvas is not initialized');
    setLoading(false);
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Canvas context is not available');
    setLoading(false);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height); // 🧹 Limpiar el canvas

  if (!baseImage) {
    console.warn('No base image provided');
    setLoading(false);
    return;
  }

  const layerOrder = [
    "Background",
    "Back",
    "RightArm",
    "Body",
    "LeftArm",
    "RightLeg",
    "LeftLeg",
    "Head",
    "Accessories",
  ];

  const orderedLayers: { traitType: string; image?: string }[] = [];
  const mergedTraits: { [traitType: string]: string } = {};

  console.log('=== Equipados (equippedTraits) ===', equippedTraits);
  console.log('=== Seleccionados (selectedTraits) ===', selectedTraits);

  // Primero, agregar los equipados
  for (const [slotIndex, traitId] of Object.entries(equippedTraits ?? {})) {
    const index = parseInt(slotIndex);
    const traitType = traitTypes[index - 1];
    if (typeof traitId === 'number' && traitURIs[traitId]) {
      mergedTraits[traitType] = traitURIs[traitId];
      console.log(`Equipado -> ${traitType}: ${traitURIs[traitId]}`);
    }
  }

  // Luego, sobreescribir con los seleccionados
  for (const [slotIndex, traitId] of Object.entries(selectedTraits ?? {})) {
    const index = parseInt(slotIndex);
    const traitType = traitTypes[index - 1];
    if (typeof traitId === 'number' && traitURIs[traitId]) {
      mergedTraits[traitType] = traitURIs[traitId];
      console.log(`Seleccionado -> ${traitType}: ${traitURIs[traitId]}`);
    }
  }

  console.log('=== Traits fusionados (mergedTraits) ===', mergedTraits);

  // Construcción en orden de capas
  for (const layerType of layerOrder) {
    if (layerType === "Body" && canUploadDriverImage) {
      let driverImage = userImage ?? userImageURL ?? (selectedNFTMetadata?.driver ? parseIpfsUrl(selectedNFTMetadata.driver) : null);
      if (driverImage instanceof File) {
        driverImage = URL.createObjectURL(driverImage);
      }
      if (driverImage) {
        orderedLayers.push({ traitType: "UserImage", image: driverImage });
        console.log(`Añadiendo imagen personalizada del cuerpo (UserImage): ${driverImage}`);
      }
    }

    if (mergedTraits[layerType]) {
      orderedLayers.push({ traitType: layerType, image: mergedTraits[layerType] });
      console.log(`Añadiendo capa: ${layerType}, imagen: ${mergedTraits[layerType]}`);
    }
  }

  console.log('=== Capas ordenadas para dibujar (orderedLayers) ===', orderedLayers);

    // Si no hay capas equipadas ni seleccionadas, dibujar solo la baseImage
    if (orderedLayers.length === 0 && baseImage) {
      try {
        const baseImg = new Image();
        baseImg.crossOrigin = "anonymous";
        baseImg.src = baseImage;
        baseImg.onload = () => {
          ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
          console.log("✅ Dibujada imagen base (sin traits)");
          setLoading(false); // ✅ Finalizar carga después de dibujar
        };
        baseImg.onerror = (err) => {
          console.error("Error al cargar la imagen base", err);
          setLoading(false);
        };
      } catch (error) {
        console.error("Error cargando la imagen base", error);
        setLoading(false);
      }
      return; // ❗ Salir para evitar continuar con lógica de traits
    }

  // Precargar todas las imágenes
  try {
    const loadedImages = await Promise.all(
      orderedLayers.map(({ image, traitType }) =>
        new Promise<{ img: HTMLImageElement; traitType: string }>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = image!;
          img.onload = () => resolve({ img, traitType });
          img.onerror = (err) => {
            console.error(`Error loading ${traitType} from ${image}`);
            reject(err);
          };
        })
      )
    );

    // Dibujar en orden una vez todas están cargadas
    for (const { img, traitType } of loadedImages) {
      let x = 0;
      let y = 0;
      let width = canvas.width;
      let height = canvas.height;

      if (traitType === "UserImage") {
        x = 469;
        y = 436;
        width = 220;
        height = 220;
      }

      ctx.drawImage(img, x, y, width, height);
      console.log(`✅ Dibujada capa: ${traitType}`);
    }

  } catch (error) {
    console.error("Error loading one or more images", error);
  }

  setLoading(false);
};




  

const uploadToIPFS = async (): Promise<string | undefined> => {
  setIsUploading(true);
  const canvas = canvasRef.current;

  if (!canvas) {
    console.error('Canvas is not initialized');
    setIsUploading(false);
    return undefined;
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          setIsUploading(false);
          reject(undefined);
          return;
        }

        const timestamp = Date.now();
        const formData = new FormData();
        formData.append('file', blob, `Satoshi_AP3_Robot_#${selectedTokenId}_${timestamp}.png`);

        try {
          const response = await fetch('/api/uploadFile', { // Ajusta la URL si es necesario
            method: 'POST',
            body: formData,
          });

          const json = await response.json();

          if (response.status === 200 && json.success) {
            console.log('Subido a IPFS con hash:', json.ipfsHash);
            setIpfsHash(json.ipfsHash);
            resolve(json.ipfsHash);
           
          } else {
            console.error('Error al subir a IPFS:', json);
            alert(`Error al subir a IPFS: ${json.message}`);
            setIsUploading(false);
            reject(undefined);
          }
        } catch (error: any) {
          console.error('Error al subir a IPFS:', error);
          if (error instanceof Error) {
            alert(`Error al subir a IPFS: ${error.message}`);
          } else {
            alert(`Error al subir a IPFS: ${JSON.stringify(error)}`);
          }
          setIsUploading(false);
          reject(undefined);
        } finally {
        }
      },
      'image/png'
    );
  });
};

  

  

  const downloadImage = () => {
  const canvas = canvasRef.current;
  if (!canvas) {
    console.error('Canvas is not initialized');
    return;
  }

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Satoshi AP3 Robot.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Limpiar la URL
  }, 'image/png');
};


  const [metadataHash, setMetadataHash] = useState<string | undefined>(undefined);


  const uploadMetadataToIPFS = async (metadata: any, selectedTokenId: number): Promise<string | undefined> => {
    try {
      const response = await fetch('/api/uploadMetadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metadata: metadata, selectedTokenId: selectedTokenId }),
      });

      const json = await response.json();

      if (response.status === 200 && json.success) {
        console.log('Metadata subida a IPFS con hash:', json.ipfsHash);
        setMetadataHash(json.ipfsHash);
        return json.ipfsHash;
      } else {
        console.error('Error al subir metadata a IPFS:', json);
        alert(`Error al subir metadata a IPFS: ${json.message}`);
        return undefined;
      }
    } catch (error) {
      console.error('Error al subir metadata a IPFS:', error);
      alert(`Error al subir metadata a IPFS: ${error}`);
      return undefined;
    }
  };

  

  const traitTypeNames: { [key: number]: string } = {
    1: "Background",
    2: "Back",
    3: "RightArm",
    4: "Body",
    5: "LeftArm",
    6: "RightLeg",
    7: "LeftLeg",
    8: "Head",
    9: "Accessories"
  };
  


  const equippedTraitsWithNames = Object.entries(equippedTraits).reduce((acc: { [key: string]: any }, [key, traitId]) => {
    const traitName = traitTypeNames[Number(key)];
  
    // ✅ Evitar acceder con null
    if (traitId !== null) {
      const traitMeta = localTraitMetadata[traitId];
      if (traitName && traitMeta) {
        acc[traitName] = {
          id: traitId,
          name: traitMeta.name,
        };
      }
    }
  
    return acc;
  }, {});
  
  
  const selectedTraitsWithNames = Object.entries(selectedTraits).reduce((acc: { [key: string]: any }, [key, traitId]) => {
    const traitName = traitTypeNames[Number(key)];
   // ✅ Evitar acceder con null
   if (traitId !== null) {
    const traitMeta = localTraitMetadata[traitId];
    if (traitName && traitMeta) {
      acc[traitName] = {
        id: traitId,
        name: traitMeta.name,
      };
    }
  }

  return acc;
}, {});

  const finalTraitsWithNames: { [key: string]: { id: string; name: string } } = {
    ...equippedTraitsWithNames,
    ...selectedTraitsWithNames, // sobrescribe los anteriores si existe el mismo traitType
  };
  
 // console.log("🧩 Traits finales con nombres:", finalTraitsWithNames);





  const handleUpload = async () => {
    setIsUploading(true);
    setIsSettingURI(false); 

  
    try {
      // 1️⃣ Subir la imagen generada en el canvas a IPFS
      const uploadedImageCid = await uploadToIPFS();
      if (!uploadedImageCid) {
        console.error("❌ No se pudo subir la imagen a IPFS");
        setLoading(false);
        return;
      }
  
      console.log("✅ Imagen subida a IPFS:", uploadedImageCid);
  
      // 2️⃣ Generar la nueva metadata con la imagen actualizada
      if (!selectedNFTMetadata) {
        console.error("❌ No se ha seleccionado metadata del NFT");
        return;
      }
  
      const updatedMetadata = { ...selectedNFTMetadata };
      updatedMetadata.image = `ipfs://${uploadedImageCid}`;
  
      console.log("📝 Metadata actualizada con la nueva imagen:", updatedMetadata);
  
      // 2.1️⃣ Identificar los traits a equipar y desequipar
      const equipableTraitTypes = ["Background", "Back", "RightArm", "Body", "LeftArm", "RightLeg", "LeftLeg", "Head", "Accessories"];
  
      // 2️⃣ Combinar equipped y selected traits en los atributos finales
      const updatedAttributes: { trait_type: string; value: string }[] = [];

      for (const traitType of equipableTraitTypes) {
        const selectedTrait = selectedTraitsWithNames[traitType];
        const equippedTrait = equippedTraitsWithNames[traitType];

        if (selectedTrait) {
          // Si hay trait seleccionado, lo usamos (sobre escribe lo equipado)
          updatedAttributes.push({
            trait_type: traitType,
            value: selectedTrait.name,
          });
        } else if (equippedTrait) {
          // Si no hay seleccionado pero hay equipado, lo mantenemos
          updatedAttributes.push({
            trait_type: traitType,
            value: equippedTrait.name,
          });
        } else {
          // Si no hay ninguno, se deja como None
          updatedAttributes.push({
            trait_type: traitType,
            value: "None",
          });
        }
      }
  
      // 2.4️⃣ Añadir o actualizar el atributo Driver
      const driverIndex = updatedAttributes.findIndex(attr => attr.trait_type === "Driver");
      if (driverIndex !== -1) {
        updatedAttributes[driverIndex].value = driverName;
      } else {
        updatedAttributes.push({ trait_type: "Driver", value: driverName });
      }
  
      updatedMetadata.attributes = updatedAttributes;
  
      console.log("📂 Atributos actualizados:", updatedAttributes);
      console.log("📂 Nueva metadata generada:", updatedMetadata);
  
      // 2.5️⃣ Añadir o actualizar la imagen del Driver solo si se puede
if (canUploadDriverImage && driverCID) {
  updatedMetadata.driver = `ipfs://${driverCID}`;
  console.log("✅ Driver image incluida en metadata:", updatedMetadata.driver);
} else {
  // ✅ Mantenemos el valor anterior si ya existía
  if (!updatedMetadata.driver) {
    console.log("🚫 No se incluye driver image en metadata y no existía antes");
  } else {
    console.log("ℹ️ Se mantiene driver image anterior:", updatedMetadata.driver);
  }
}
  
         // 3️⃣ Subir la metadata actualizada a IPFS
    if (selectedTokenId === null) {
      console.error("No token ID selected.");
      return;
    }

    console.log("🔄 Intentando subir la metadata a IPFS...");

    const uploadedMetadataCid = await uploadMetadataToIPFS(updatedMetadata, selectedTokenId);
    if (!uploadedMetadataCid) {
      console.error("❌ No se pudo subir la metadata a IPFS");
      return;
    }

    console.log("✅ Metadata subida a IPFS:", uploadedMetadataCid);
    setNewMetadataCid(uploadedMetadataCid);
    setIsUploading(false);
setIsSettingURI(true);

  } catch (error) {
    console.error("❌ Error en handleUpload:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (!canUploadDriverImage) {
      setUserImageIPFS(null);
      setUserImageURL(null);
      setImageFile(null);
      setImageUploaded(false);
      setDriverCID(null);
    }
  }, [canUploadDriverImage]);  


  // VENTANA MODAL

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    setNft(null);       // Resetear NFT
    setIsUploading(false); // Asegurar que siempre inicie en "Subir Metadata"
    setIsSettingURI(false); // Resetear para evitar que brinque a otro paso
    setIsUpdating(false);   // Asegurar que no quede en estado de actualización previa
    setUpdatedNft(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUpdatedNft(null);  };

      // LLAMAMOS A SETTOKENBASEURI

      const { mutate: sendTransaction } = useSendTransaction();

const [loadingURI, setLoadingURI] = useState(false);
const [isUpdating, setIsUpdating] = useState(false); // Para manejar el estado de actualización on-chain
const [nft, setNft] = useState<NFT | null>(null); // Guardamos el NFT actualizado

const onClickSetUri = async () => {
  console.log("🚀 onClickSetUri llamado");
  //setIsUpdating(true);

  if (!newMetadataCid) {
    alert("No se ha subido la metadata");
    return;
  }

  const metadataUri = `ipfs://${newMetadataCid}`;
  const tokenId = BigInt(selectedTokenId ?? 0);
  const traitsToEquip = toEquip.map((id) => BigInt(id));
  const traitsToUnequip = toUnequip.map((id) => BigInt(id));

  console.log("metadataUri:", metadataUri);
  console.log("tokenId:", tokenId);
  console.log("traitsToEquip:", traitsToEquip);
  console.log("traitsToUnequip:", traitsToUnequip);

  const uniqueEquip = traitsToEquip.filter((id) => !traitsToUnequip.includes(id));
  const uniqueUnequip = traitsToUnequip.filter((id) => !traitsToEquip.includes(id));

  console.log("uniqueEquip:", uniqueEquip);
  console.log("uniqueUnequip:", uniqueUnequip);

  setIsSettingURI(true);
  console.log("Paso 2: setIsSettingURI(true)");

  const tx = prepareContractCall({
    contract: mechasContract,
    method: "function updateTraitsAndMetadata(uint256, uint256[], uint256[], string)",
    params: [tokenId, uniqueEquip, uniqueUnequip, metadataUri],
  });

  console.log("tx:", tx);

  sendTransaction(tx, {
    onSuccess: async () => {
      console.log("✅ URI y traits actualizados");
      setIsSettingURI(false);
      setIsUpdating(true);
      console.log("Paso 3: setIsUpdating(true)");

      await new Promise((resolve) => setTimeout(resolve, 3000));
      await refetch(); // Asegúrate de que 'refetch' esté definido y sea accesible

      const updated = ownedMechas.find(
        (nft) => BigInt(nft.id) === tokenId
      );

      if (updated) {
        setUpdatedNft(updated); // Paso 4 visible
        console.log("Paso 4: setUpdatedNft(updated)");
      } else {
        console.warn("⚠️ No se encontró el NFT actualizado");
      }

      setIsUpdating(false);
      setResetTraits(true);

    },
    onError: (err) => {
      console.error("❌ Error al actualizar URI", err);
      alert("Error en la transacción");
      setIsSettingURI(false);
      setIsUpdating(false);
    },
  });
};





const [updatedNft, setUpdatedNft] = useState<NFT | null>(null);

// Efecto que actualiza el estado de updatedNft cuando cambia selectedTokenId
useEffect(() => {
  if (selectedTokenId) {
    const found = ownedMechas.find((nft) => BigInt(nft.id) === BigInt(selectedTokenId));
    if (found) setUpdatedNft(found); // No poner null si no lo encuentra aún
  }
}, [selectedTokenId, ownedMechas]);


useEffect(() => {
  console.log("🧠 Estado de traits:");
  console.log("SelectedTraits[4]:", selectedTraits[4]);
  console.log("EquippedTraits[4]:", equippedTraits[4]);
  console.log("➡ canUploadDriverImage:", canUploadDriverImage);
}, [selectedTraits, equippedTraits]);


// APPROVE CONTRACT

 const partsContract = useMemo(() => {
        return getContract({
          client: client,
          chain: chain,
          address: TRAITS_CONTRACT.address,
        });
      }, [account, chain]);

    // APPROVE FUNCTIONALITY
    const [isApproved, setIsApproved] = useState(false);
  
    // 🔹 Verificar si ERC721ZZ ya está aprobado en ERC1155Z
    const { data: approvalData } = useReadContract({
      contract: partsContract,
      method: "function isApprovedForAll(address owner, address operator) view returns (bool)",
      params: [account?.address || "", mechasContract.address],
    });
  
    useEffect(() => {
      if (approvalData !== undefined) {
        setIsApproved(approvalData);
      }
    }, [approvalData]);


     // 🔹 Función para aprobar el contrato ERC1155Z
const approveContract = () => {
  const transaction = prepareContractCall({
    contract: partsContract,
    method: "function setApprovalForAll(address operator, bool approved)",
    params: [mechasContract.address, true],
  });
  sendTransaction(transaction, {
    onSuccess: () => {
      setIsApproved(true); // ✅ Una vez aprobado, actualizamos el estado
    },
  });
};


// Resetear toEquip y toUnequip
  // Resetear al cambiar el token base seleccionado o metadata actualizada
  const [resetTraits, setResetTraits] = useState(false);

  // Resetear toEquip y toUnequip
  useEffect(() => {
    if (resetTraits) {
      setToEquip([]);
      setToUnequip([]);
      setResetTraits(false); // Resetear el estado de reseteo
    }
  }, [resetTraits, selectedTokenId]);
  


  return (
    <main>
    <div>
    <canvas
  ref={canvasRef}
  width="1024"
  height="1024"
  className="border-4 border-black w-full max-w-[512px] h-auto mx-auto"
/>
{loading && <p>Loading...</p>}

</div>

<section className="flex flex-row justify-between">
<div>
{/* Botón para abrir la modal */}
<button
      onClick={openModal}
      disabled={
        !(
          (equippedTraits?.[1] !== undefined && equippedTraits?.[1] !== null) ||
          (selectedTraits?.[1] !== undefined && selectedTraits?.[1] !== null) ||
          (!hasTraits && baseImage)
        ) || loading
      }
      className={`
        my-4 px-4 py-2 rounded-md transition
        ${
          loading
            ? "bg-gray-300 text-gray-600 cursor-not-allowed" // Estilo cuando está loading
            : (equippedTraits?.[1] !== undefined && equippedTraits?.[1] !== null) ||
              (selectedTraits?.[1] !== undefined && selectedTraits?.[1] !== null) ||
              (!hasTraits && baseImage)
            ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer" // Estilo cuando está habilitado
            : "bg-gray-300 text-gray-600 cursor-not-allowed" // Estilo cuando está deshabilitado
        }
      `}
    >
      Assemble
    </button>


      {/* Modal */}
      {isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg w-96 relative text-black">
      <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500">X</button>

      {isUploading ? (
  // Paso 1: Upload Metadata
  <>
    <h1 className="text-xl font-semibold mb-4">Step 1: Upload Metadata</h1>
    <button
      onClick={handleUpload}
      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
      disabled={isUploading}
    >
      {isUploading ? "Uploading..." : "Upload to IPFS"}
    </button>
  </>
) : updatedNft ? (
  // Paso 4: NFT actualizado
  <>
    <h1 className="text-xl font-semibold mb-4">Robot #{selectedTokenId} updated!</h1>
    <MediaRenderer
      client={client}
      src={updatedNft.metadata.image}
      className="shadow-[5px_5px_0px_0px_rgba(53,35,65)] border-4 border-solid border-[#352341]"
      style={{ borderRadius: "15px", width: "200px", height: "200px", marginBottom: "20px" }} 
    /> 
    <h2>{updatedNft.metadata.name}</h2>
   
  </>
) : isUpdating ? (
  // Paso 3: Esperando actualización on-chain
  <>
    <h1 className="text-xl font-semibold mb-4">Step 3: Updating your Robot on-chain</h1>
    <div>Wait while your Robot is updating...</div>
  </>
) : isSettingURI ? (
  // Paso 2: Establecer URI
  <>
    <h1 className="text-xl font-semibold mb-4">Step 2: Assemble your Robot</h1>

    {!isApproved ? (
      <button
        onClick={approveContract}
        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
      >
        Approve NFTs
      </button>
    ) : (
      <button
        onClick={() => {
          console.log("Botón 'Establecer URI de Token' clickeado");
          onClickSetUri();
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
      >
        Update metadata
      </button>
    )}
  </>
) : (
  // Paso 1 (por defecto si no hay flags activos)
  <>
    <h1 className="text-xl font-semibold mb-4">Step 1: Upload Metadata</h1>
    <button
      onClick={handleUpload}
      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
      disabled={isUploading}
    >
      Upload to IPFS
    </button>
  </>
)}

    </div>
  </div>
)}

    </div>
<div>
<button onClick={downloadImage} disabled={loading}     className="my-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition cursor-pointer"
>
Download
</button>
</div>
</section>

{!(
  (equippedTraits?.[1] !== undefined && equippedTraits?.[1] !== null) ||
  (selectedTraits?.[1] !== undefined && selectedTraits?.[1] !== null) ||
  (!hasTraits && baseImage)
) && (
  <p className="text-sm text-gray-600 mb-2">
    Equip a Background to update your Robot.
  </p>
)}

<div>
  <p>Traits to Equip: {toEquip.map((id) => id.toString()).join(", ")}</p>
  <p>Traits to Unequip: {toUnequip.map((id) => id.toString()).join(", ")}</p>
</div>
    </main>
  );
};

export default NFTCanvas;

