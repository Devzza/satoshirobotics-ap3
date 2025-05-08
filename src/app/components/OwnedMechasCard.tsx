"use client";

import { NFT } from "thirdweb";
import { useState } from "react";
import { MediaRenderer } from "thirdweb/react";
import { client } from "../client";
import { FaRegCircleCheck, FaRegCircle } from "react-icons/fa6";

type MechaCardProps = {
  nft: NFT;
  onSelect: () => void;
  isSelected: boolean;
};

type Attribute = {
  trait_type: string;
  value: string;
};

function isAttributeArray(
  data: unknown
): data is Attribute[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "trait_type" in item &&
        "value" in item
    )
  );
}

export const OwnedMechasCard = ({ nft, onSelect, isSelected }: MechaCardProps) => {
  const { name, image, description, attributes } = nft.metadata;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const safeAttributes: Attribute[] = isAttributeArray(attributes) ? attributes : [];

  // Función para manejar el click en el NFT y actualizar el estado
  const handleSelect = () => {
    console.log("NFT seleccionado:", nft.id); // Agregar un log para verificar la selección
    onSelect(); // Llamar a onSelect para actualizar el estado en el componente padre
  };


      return (
      
        <section className="w-full max-w-[300px] sm:max-w-full mx-auto">
        <div
          onClick={handleSelect}
          className={`cursor-pointer transition-all rounded-2xl border ${
            isSelected ? "border-[#ff6700] ring-2 ring-[#ff6700]" : "border-[#333]"
          } bg-[#1a1a1a] shadow-md overflow-hidden text-white relative`}
        ><div className="absolute top-2 right-2 text-white text-2xl z-10">
    {isSelected ? <FaRegCircleCheck className="text-green-500" /> : <FaRegCircle className="text-white/80" />}
  </div>
  <MediaRenderer
    client={client}
    src={nft.metadata.image}
    className="w-full rounded-t-2xl mb-4"
  />
  <div className="p-4">
    <h3 className="text-xl font-semibold mb-2">{name}</h3>

    {safeAttributes.length > 0 && (
      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-2 px-4 py-2 bg-[#ff6700] text-white text-sm rounded hover:bg-[#e85d00] cursor-pointer"
      >
        See Parts Equipped
      </button>
    )}
  </div>
</div>
    
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-[#1a1a1a] rounded-xl p-6 max-w-md w-full border border-[#333]">
                <h2 className="text-lg font-bold mb-4 text-white">Attributes</h2>
                <div className="space-y-2 text-sm">
                  {safeAttributes.map((attr, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-400">{attr.trait_type}:</span>
                      <span className="text-gray-200">{attr.value}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-6 w-full py-2 rounded bg-[#ff6700] hover:bg-[#e85d00] text-white font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          </section>
        
      );
};
