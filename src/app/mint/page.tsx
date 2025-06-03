'use client'

import { defineChain, getContract, prepareContractCall, toEther, toWei } from "thirdweb";
{/*define chain*/}
import { client } from "../client";
import { MediaRenderer, TransactionButton, useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { getContractMetadata } from "thirdweb/extensions/common";
import { claimTo, getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useEffect, useState } from "react";
import { FaCircleMinus, FaCirclePlus, FaRegCircleCheck } from "react-icons/fa6";
import Image from "next/image";
import { AdminAddress, BASE_CONTRACT } from "../../../constants/addresses";
import { chain } from "../chain";
import NavBar from "../components/NavBar";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { useMechas } from "@/context/MechasProvider";
import TopBar from "../components/TopBar";




export default function Claim() {
    const { ownedNFTs, refetch } = useMechas();
  
    const account = useActiveAccount();

    const adminAddress = AdminAddress;

    const [quantity, setQuantity] = useState(1);

    const [mintSuccess, setMintSuccess] = useState(false);


    {/*define contract address*/}

    const contract = getContract({
        client: client,
        chain: chain,
        address: BASE_CONTRACT.address,
    });

    const { data: contractMetadata, isLoading: isContractMetadataLoading } = useReadContract( getContractMetadata,
        { contract: contract}
    );

    const { data: claimedSupply, isLoading: isClaimSupplyLoading } = useReadContract( getTotalClaimedSupply,
        { contract: contract}
    );

    const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract( nextTokenIdToMint,
        { contract: contract}
    );

    const [phase, setPhase ] = useState(0);

    const { data: currentPhase, isLoading: isCurrentPhaseLoading } = useReadContract({
        contract,
        method: "function currentPhase() view returns (uint8)",
        params: [],
      });

      useEffect(() => {
        if (currentPhase !== undefined) {
          setPhase(Number(currentPhase));
        }
      }, [currentPhase]);


    const {data: phasePrices, isLoading: isPhasePricesLoading }= useReadContract({
        contract,
        method:
          "function phasePrices(uint8) view returns (uint256)",
        params: [Number(phase)],
      });

const { data: whitelistAllowanceAmount, isLoading: isWhitelistLoading } = useReadContract({
  contract,
  method: "function whitelistAllowance(address) view returns (uint256)",
  params: [account?.address || "0x0000000000000000000000000000000000000000"],
});

 const { data: whitelistMintedAmount, isLoading: isWhitelistMintedLoading } = useReadContract({
    contract,
    method: "function whitelistMinted(address) view returns (uint256)",
    params: [account?.address || "0x0000000000000000000000000000000000000000"],
  });

  let remainingAllowance = 0;
  let isWhitelisted = false;
  let hasMintedAllAllowed = false; // Nueva variable

   if (!isWhitelistLoading && !isWhitelistMintedLoading) {
    const allowance = Number(whitelistAllowanceAmount || 0);
    const minted = Number(whitelistMintedAmount || 0);

    remainingAllowance = allowance - minted;
    isWhitelisted = allowance > 0; // Una wallet con allowance > 0 está en la whitelist
    hasMintedAllAllowed = allowance > 0 && minted >= allowance; // Verifica si ya minteó todo su allowance

    console.log("allowance:", allowance);
    console.log("minted:", minted);
    console.log("remainingAllowance:", remainingAllowance);
    console.log("isWhitelisted:", isWhitelisted);
    console.log("hasMintedAllAllowed:", hasMintedAllAllowed);
  }


 const [mintMessage, setMintMessage] = useState('');

   useEffect(() => {
    console.log("isCurrentPhaseLoading:", isCurrentPhaseLoading);
    console.log("phase:", phase);
    console.log("account?.address:", account?.address);
    console.log("adminAddress:", adminAddress);
    console.log("isWhitelistLoading:", isWhitelistLoading);
    console.log("isWhitelistMintedLoading:", isWhitelistMintedLoading);
    console.log("isWhitelisted:", isWhitelisted);
    console.log("whitelistAllowance:", whitelistAllowanceAmount);
    console.log("whitelistMinted:", whitelistMintedAmount?.toString()); // Imprime el valor actual de whitelistMinted
    console.log("hasMintedAllAllowed:", hasMintedAllAllowed);

    if (isCurrentPhaseLoading) {
      setMintMessage('Loading sale phase...');
    } else if (phase === 0 && account?.address?.toLowerCase() !== adminAddress.toLowerCase()) {
      setMintMessage('Owner phase');
    } else if (phase === 1 && !isWhitelistLoading && !isWhitelistMintedLoading) {
      if (!isWhitelisted) {
        setMintMessage('You are not whitelisted!');
      } else if (hasMintedAllAllowed) {
        setMintMessage('You already minted!');
      } else {
        setMintMessage(''); // No message, show mint button
      }
    } else {
      setMintMessage(''); // Default: no message
    }
  }, [isCurrentPhaseLoading, phase, account?.address, adminAddress, isWhitelistLoading, isWhitelistMintedLoading, isWhitelisted, hasMintedAllAllowed, whitelistMintedAmount]);
 
  // Calcular si se ha alcanzado el "sold out"
const isSoldOut =
  !isClaimSupplyLoading &&
  !isTotalSupplyLoading &&
  claimedSupply !== undefined &&
  totalNFTSupply !== undefined &&
  claimedSupply >= totalNFTSupply;

      const [isModalOpen, setIsModalOpen] = useState(false);

      const [isLoading, setIsLoading] = useState(false);
      const { mutateAsync: sendTransaction } = useSendTransaction();

      const getPrice = (quantity: number): bigint => {
        if (!phasePrices || phase === 0) return BigInt(0);
        const total = BigInt(phasePrices) * BigInt(quantity);
        return total;
      };
    
      const handleMint = async () => {
        if (!contract || !account?.address) {
          alert("Falta contrato o wallet");
          return;
        }
      
        setIsLoading(true);        // Mostrar loader
        setMintSuccess(false);     // Aún no ha sido exitoso
      
        try {
          const transaction = prepareContractCall({
            contract,
            method: {
              name: "claim",
              type: "function",
              inputs: [
                { name: "_receiver", type: "address" },
                { name: "_quantity", type: "uint256" },
              ],
              outputs: [],
              stateMutability: "payable",
            },
            params: [account.address, BigInt(quantity)],
            value: phase === 0 ? undefined : getPrice(quantity),
          });
      
          const result = await sendTransaction(transaction);
      
          if (result?.transactionHash) {
            setMintSuccess(true); // Mostrar <ClaimCapsules />
          } else {
            alert("Transacción no enviada o cancelada");
          }
      
        } catch (err) {
          console.error("Error durante el mint:", err);
          alert("Hubo un error al mintear");
        } finally {
          setIsLoading(false); // Ocultar loader
        }
      };
      


    return (
      <section className="w-full min-h-screen bg-[url('/mintbg.svg')] bg-cover bg-center bg-no-repeat">
        <TopBar message="We recommend using the desktop version. We're still working on the mobile version for a better experience." backgroundColor="#0303d1" textColor="#fff" />

  <NavBar />

  <div className="flex w-full h-full min-h-screen flex-col lg:flex-row">
    {/* Columna izquierda vacía (solo visible en desktop) */}
    <div className="w-1/2 hidden lg:block"></div>

    {/* Columna derecha con título y botón */}
    <div className="w-full lg:w-1/2 flex items-center justify-start mb-[100px] h-full p-16">
    <div className="w-full flex flex-col items-start justify-center h-full text-left lg:px-16">
    <h1 className="text-6xl font-black text-white mb-6">Satoshi AP3 Kit</h1>

    <div className="text-gray-300 font-regular space-y-4 mb-6">
  <p><strong>Introducing the Satoshi Robot AP3 Kit</strong> — the first-ever NFT robot engineered for your digital avatar.</p>

  <p>Crafted with modular precision, the AP3 is fully customizable and comes ready to be piloted by your PFP of choice. Just upload your image, and it seamlessly integrates into the cockpit — no tools required.</p>

  <p>There are only 2,222 units of the AP3 available to mint — some of them are pre-built legendary robots.</p>

  <p>Includes:</p>

  <div
  className="flex items-center w-full flex-row my-8 py-6 pl-12 pr-4 isolate [unicode-bidi:isolate] bg-[#1d1e21] rounded-xl relative before:content-[''] before:absolute before:w-1 before:h-4/5 before:bg-[#373c3d] before:z-[10] before:left-6"
>
  <p className="white-space-pre-wrap text-[#9c9c9c] flex items-center gap-3">
    <FaRegCircleCheck className="text-green-400" />
    <span className="font-semibold">Robot Core.</span>
  </p>
</div>

<div
  className="flex items-center w-full flex-row my-8 py-6 pl-12 pr-4 isolate [unicode-bidi:isolate] bg-[#1d1e21] rounded-xl relative before:content-[''] before:absolute before:w-1 before:h-4/5 before:bg-[#373c3d] before:z-[10] before:left-6"
>
<p className="white-space-pre-wrap text-[#9c9c9c] flex items-center gap-3">
    <FaRegCircleCheck className="text-green-400" />
    <span className="font-semibold"> Up to 9 different buildable and tradeable NFT robot parts.</span>
  </p>
</div>
  

  <p>Built by Satoshi Robotics, Inc., the AP3 represents the next generation of identity expression:</p>

  <p>Modular. Tokenized. Yours.</p>

  <p>On Apechain.</p>
</div>

<div className="flex flex-row gap-4 justify-end mb-4">

<div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="cursor-pointer mr-2 font-bold text-xl text-white"
          >
            <CiCircleMinus />
          </button>

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            style={{
              width: "50px",
              textAlign: "center",
              borderRadius: "2px",
              backgroundColor: "#e1e1e1",
              color: "#000",
              paddingTop: "5px",
              paddingBottom: "5px",
            }}
          />

          <button
            onClick={() => setQuantity(Math.max(1, quantity + 1))}
            className="cursor-pointer ml-2 font-bold text-xl text-white"
          >
            <CiCirclePlus />
          </button>
        </div>

        <div>
    <p className="text-lg text-green-600">{toEther(BigInt(getPrice(quantity)))} $APE</p>
  </div>


</div>
        

       {mintMessage ? (
  <p className="text-red-600 font-bold mt-4">{mintMessage}</p>
) : (
  <div className="py-2 w-full h-16 bg-no-repeat bg-contain bg-center flex flex-col gap-4 items-start justify-start ">
    <button
  onClick={handleMint}
  className={`px-6 py-3 w-full text-white font-semibold rounded-xl shadow-lg transition duration-300 ${
    isSoldOut
      ? 'bg-gray-400 cursor-not-allowed' // Estilos para "Sold Out"
      : 'bg-blue-600 hover:bg-blue-700 cursor-pointer' // Estilos normales
  }`}
  disabled={isSoldOut} // Deshabilitar el botón si isSoldOut es verdadero
>
  {isSoldOut ? 'Sold Out' : 'Mint'} {/* Cambiar el texto del botón */}
</button>

    {/*
    <TransactionButton
      transaction={() =>
        prepareContractCall({
          contract: contract,
          method: "function claim(address,uint256)",
          params: [account?.address || "", BigInt(quantity)],
        })
      }
      value={phase !== 0 ? getPrice(quantity) : undefined}
      onTransactionConfirmed={async () => {
        alert("NFT minted");
        refetch();
      }}
      className="px-6 py-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition duration-300"
    >
      {`Mint`}
    </TransactionButton>
    */}
  </div>
)}

        <div className="flex flex-col">

        <p className="text-gray-300 mt-4" style={{ fontSize: "16px" }}>
          Minted: {claimedSupply?.toString()}/{totalNFTSupply?.toString()}
        </p>
          {isWhitelisted && (phase === 0 || phase === 1) && (
  <p className="text-green-600 font-bold mt-4">
    You are whitelisted and allowed to mint {remainingAllowance?.toString()} NFTs.
  </p>
)}
        </div>
      </div>
    </div>
  </div>
  
</section>

    
    )
}