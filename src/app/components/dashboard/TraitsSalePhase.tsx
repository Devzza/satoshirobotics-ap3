"use client";

import { useSendTransaction } from "thirdweb/react";
import { prepareContractCall, readContract, toEther, toWei } from "thirdweb";
import { TRAITS_CONTRACT } from "../../../../constants/addresses"; // Asegúrate de que este sea el contrato correcto
import { useEffect, useState } from "react";

const phaseNames: Record<number, string> = {
  0: "Owner",
  1: "Private",
  2: "Public",
};

export default function TraitsSalePhase() {
  const [newPhase, setNewPhase] = useState<number>(0);
  const [newPrice, setNewPrice] = useState<string>("0");
  const [paymentToken, setPaymentToken] = useState<string>("");
  const [phaseSupply, setPhaseSupply] = useState<string>("0");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [tokenId, setTokenId] = useState<number>(0); // Asumimos que el tokenId lo tomas del formulario o algún contexto
  const [phase, setPhase] = useState<string | null>(null);
  const [whitelist, setWhitelist] = useState<string>("");

  const { mutate: sendTransaction, isPending } = useSendTransaction();

  const handleSetPhase = () => {
    const tx = prepareContractCall({
      contract: TRAITS_CONTRACT,
      method:
        "function setSalePhase(uint256 tokenId, uint8 phase, uint256 price, address paymentToken, uint256 phaseSupply, string tokenSymbol, uint8 tokenDecimals)",
      params: [
        BigInt(tokenId),
        newPhase,
        toWei(newPrice),
        paymentToken,
        BigInt(phaseSupply),
        tokenSymbol,
        tokenDecimals,
      ],
    });
    sendTransaction(tx);
  };


 useEffect(() => {
    const fetchPhase = async () => {
      try {
        // Leer la fase del contrato
        const phaseRaw = await readContract({
            contract: TRAITS_CONTRACT,
            method: "function activePhase(uint256) view returns (uint8)",
            params: [BigInt(tokenId)],
          });
    

        // Traducir la fase
        let phaseLabel: string;
        switch (phaseRaw) {
          case 0:
            phaseLabel = "Owner";
            break;
          case 1:
            phaseLabel = "Private";
            break;
          case 2:
            phaseLabel = "Public";
            break;
          default:
            phaseLabel = "Unknown";
        }

        setPhase(phaseLabel);
      } catch (err) {
        console.error("Error fetching phase:", err);
        setPhase(null);
      }
    };

    fetchPhase();
  }, [tokenId]);


   // Añadir a whitelist
    const handleAddToWhitelist = () => {
      const addresses = whitelist
        .split(",")
        .map((addr) => addr.trim())
        .filter((addr) => addr.length > 0);
      const tx = prepareContractCall({
        contract: TRAITS_CONTRACT,
        method:
        "function addToWhitelist(uint256 tokenId, uint8 phase, address[] addresses)",
      params: [BigInt(tokenId), Number(phase), addresses],
      });
      sendTransaction(tx);
    };



  return (
    <section>
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Set Sale Phase for Traits</h2>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        {/* Fase de venta */}
        <div>
          <label htmlFor="tokenId" className="block font-medium">
            Token ID
          </label>
          <input
            id="tokenId"
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(Number(e.target.value))}
            className="mt-2 p-2 border border-gray-300 rounded w-full"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="phase" className="block font-medium">Sale Phase</label>
          <select
            id="phase"
            value={newPhase}
            onChange={(e) => setNewPhase(Number(e.target.value))}
            className="mt-2 p-2 border border-gray-300 rounded w-full"
          >
            <option value={0}>Owner</option>
            <option value={1}>Private</option>
            <option value={2}>Public</option>
          </select>
        </div>

        {/* Precio */}
        <div>
          <label htmlFor="newPrice" className="block font-medium">Price</label>
          <input
            id="newPrice"
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="mt-2 p-2 border border-gray-300 rounded w-full"
            min="0"
          />
        </div>

        {/* Token de pago */}
        <div>
          <label htmlFor="paymentToken" className="block font-medium">Payment Token Address (0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)</label>
          <input
            id="paymentToken"
            type="text"
            value={paymentToken}
            onChange={(e) => setPaymentToken(e.target.value)}
            className="mt-2 p-2 border border-gray-300 rounded w-full"
          />
        </div>

        {/* Suministro máximo para la fase */}
        <div>
          <label htmlFor="phaseSupply" className="block font-medium">Phase Supply</label>
          <input
            id="phaseSupply"
            type="number"
            value={phaseSupply}
            onChange={(e) => setPhaseSupply(e.target.value)}
            className="mt-2 p-2 border border-gray-300 rounded w-full"
            min="1"
          />
        </div>

        {/* Símbolo del token */}
        <div>
          <label htmlFor="tokenSymbol" className="block font-medium">Token Symbol</label>
          <input
            id="tokenSymbol"
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            className="mt-2 p-2 border border-gray-300 rounded w-full"
          />
        </div>

        {/* Decimales del token */}
        <div>
          <label htmlFor="tokenDecimals" className="block font-medium">Token Decimals</label>
          <input
            id="tokenDecimals"
            type="number"
            value={tokenDecimals}
            onChange={(e) => setTokenDecimals(Number(e.target.value))}
            className="mt-2 p-2 border border-gray-300 rounded w-full"
          />
        </div>

        {/* Botón para enviar la transacción */}
        <button
          type="button"
          onClick={handleSetPhase}
          className="mt-4 p-2 bg-blue-500 text-white rounded w-full"
        >
          Set Sale Phase
        </button>
      </form>
    </div>

    {/* Mostrar whitelist solo si la fase actual es privada */}
    {Number(phase) === 1 && (
        <div className="mt-6">
          <label className="block font-semibold">Whitelist (direcciones separadas por coma):</label>
          <textarea
            className="border p-2 rounded w-full"
            value={whitelist}
            onChange={(e) => setWhitelist(e.target.value)}
            rows={3}
            placeholder="0x123..., 0xabc..., ..."
          />
          <button
            onClick={handleAddToWhitelist}
            className="bg-purple-500 text-white mt-2 px-4 py-2 rounded cursor-pointer"
          >
            Añadir a whitelist
          </button>
        </div>
      )}

    </section>
  );
}
