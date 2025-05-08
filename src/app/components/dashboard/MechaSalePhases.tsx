"use client";

import { useReadContract, useSendTransaction } from "thirdweb/react";
import { prepareContractCall, toEther, toWei } from "thirdweb";
import { BASE_CONTRACT } from "../../../../constants/addresses";
import { useState } from "react";

const phaseNames: Record<number, string> = {
  0: "Owner",
  1: "Privada",
  2: "Pública",
};

export default function MechaSalePhases() {
  const [newPhase, setNewPhase] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<string>("0");
  const [whitelist, setWhitelist] = useState<string>(""); // texto separado por comas
  
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  
  const { data: currentPhase, isPending: loadingCurrentPhase } = useReadContract({
    contract: BASE_CONTRACT,
    method: "function currentPhase() view returns (uint8)",
    params: [],
  });
  
  const { data: phasePrice, isPending: loadingPhasePrice } = useReadContract({
    contract: BASE_CONTRACT,
    method: "function phasePrices(uint8) view returns (uint256)",
    params: [currentPhase || 0],
  });
  
  const formattedPrice =
    phasePrice !== undefined
      ? `${parseFloat(toEther(BigInt(phasePrice.toString()))).toFixed(3)} APE`
      : "-";
  
  const frenlyPhaseName =
    currentPhase !== undefined
      ? phaseNames[currentPhase as number] ?? `Fase desconocida (${currentPhase})`
      : null;
  
  // Cambiar fase
  const handleSetPhase = () => {
    const tx = prepareContractCall({
      contract: BASE_CONTRACT,
      method: "function setSalePhase(uint8 phase)",
      params: [newPhase],
    });
    sendTransaction(tx);
  };
  
  // Establecer precio
  const handleSetPrice = () => {
    const priceInWei = toWei(newPrice); // convierte el valor en ETH a BigInt wei
    const tx = prepareContractCall({
      contract: BASE_CONTRACT,
      method: "function setPhasePrice(uint8 phase, uint256 price)",
      params: [newPhase, priceInWei],
    });
    sendTransaction(tx);
  };
  
  /*
  // Establecer fase + precio en una sola transacción
  const handleSetPhaseAndPrice = () => {
    const priceInWei = toWei(newPrice); // convierte el valor en ETH a BigInt wei
    const tx = prepareContractCall({
      contract: BASE_CONTRACT,
      method: "function setPhaseAndPrice(uint8 phase, uint256 price)",
      params: [newPhase, priceInWei],
    });
    sendTransaction(tx);
  };
  */
  
  // Añadir a whitelist
  const handleAddToWhitelist = () => {
    const addresses = whitelist
      .split(",")
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0);
    const tx = prepareContractCall({
      contract: BASE_CONTRACT,
      method: "function addToWhitelist(address[] addresses)",
      params: [addresses],
    });
    sendTransaction(tx);
  };



  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Fases de venta</h2>

      <p>
        <strong>Fase actual:</strong>{" "}
        {loadingCurrentPhase ? "Cargando..." : frenlyPhaseName}
      </p>

      <p>
        <strong>Precio:</strong>{" "}
        {loadingPhasePrice ? "Cargando..." : formattedPrice}
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block font-semibold">Nueva fase (0 = Owner, 1 = Privada, 2 = Pública):</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            value={newPhase}
            onChange={(e) => setNewPhase(parseInt(e.target.value))}
          />
          <button onClick={handleSetPhase} className="bg-blue-500 text-white mt-2 px-4 py-2 rounded cursor-pointer">
            Establecer fase
          </button>
        </div>

        <div>
          <label className="block font-semibold">Precio para fase {newPhase} (en APE):</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <button onClick={handleSetPrice} className="bg-green-500 text-white mt-2 px-4 py-2 rounded cursor-pointer">
            Establecer precio
          </button>
        </div>

        {currentPhase === 1 && (
          <div>
            <label className="block font-semibold">Whitelist (direcciones separadas por coma):</label>
            <textarea
              className="border p-2 rounded w-full"
              value={whitelist}
              onChange={(e) => setWhitelist(e.target.value)}
              rows={3}
              placeholder="0x123..., 0xabc..., ..."
            />
            <button onClick={handleAddToWhitelist} className="bg-purple-500 text-white mt-2 px-4 py-2 rounded cursor-pointer">
              Añadir a whitelist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
