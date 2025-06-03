"use client";

import { client } from "@/app/client";
import { React, useEffect, useState } from "react";
import { MediaRenderer, useActiveAccount, useSendTransaction, useWaitForReceipt } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { IoClose } from "react-icons/io5";


type Props = {
  nft: {
    id: bigint;
    metadata: {
      name: string;
      description?: string;
      image: string;
      attributes?: { trait_type: string; value: string }[];
    };
  };
  baseContract: any;
refetch: () => void;
};

export default function CoreCard({ nft, baseContract, refetch }: Props) {
  const { name, image, description, attributes } = nft.metadata;

  const account = useActiveAccount();

const tokenId = nft.id;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [addressError, setAddressError] = useState('');
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [isConfirming, setIsConfirming] = useState(false);
 

  // Función para convertir IPFS a gateway público
  const resolveImage = (url: string) => {
    if (!url) return "";
    return url.startsWith("ipfs://")
      ? url.replace("ipfs://", "https://ipfs.io/ipfs/")
      : url;
  };

  // Transfer

  const { mutateAsync: sendTransaction, isLoading: isSendLoading } = useSendTransaction();

    const { data: receipt, isLoading: isWaiting, error: waitError } = useWaitForReceipt(txHash ? { transactionHash: txHash } : undefined);

   useEffect(() => {
    if (receipt && txHash) {
      if (receipt.status === 1) {
        console.log("Transaction confirmed!");
        refetch(); // Ejecutar la función refetch después de la confirmación
        setIsModalOpen(false); // Close modal after successful transfer
        setIsConfirming(false); // Reset confirming state
      } else {
        console.error("Transaction failed!");
        alert("Transaction failed!");
        setIsConfirming(false); // Reset confirming state
      }
    } else if (waitError) {
      console.error("Error waiting for transaction:", waitError);
      alert(`Error waiting for transaction: ${waitError.message}`);
      setIsConfirming(false); // Reset confirming state
    }
  }, [receipt, refetch, setIsModalOpen, waitError, txHash]);

  const onClickTransfer = async () => {
    try {
      const transaction = prepareContractCall({
        contract: baseContract,
        method: "function safeTransferFrom(address from, address to, uint256 tokenId)",
        params: [account?.address, transferAddress, tokenId],
      });

      const txResult = await sendTransaction(transaction);

      // Agregar un retraso antes de verificar el recibo
      setTimeout(() => {
        // Verificar si txResult es null o undefined
        if (!txResult) {
          console.error("Transaction failed!");
          alert("Transaction failed!");
          setIsConfirming(false); // Reset confirming state
          return;
        }

        // Verificar si txResult.receipt existe antes de acceder a transactionHash
        if (txResult.receipt) {
          setTxHash(txResult.receipt.transactionHash); // Guardar el hash de la transacción
        } else {
          console.error("Transaction receipt not found!");
          setIsConfirming(false); // Reset confirming state
        }
      }, 1000); // Esperar 1 segundo
    } catch (error: any) {
      console.error('Failed to transfer NFT', error);
      alert(`Transfer failed: ${error.message}`); // Show error message
      setIsConfirming(false); // Reset confirming state
    }
  };


    const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTransferAddress(event.target.value);
  };
  
  const handleRefetchClick = () => {
    console.log("Refetch button clicked!");
    refetch(); // Llama a la función refetch al hacer clic en el botón
  };

    const closeModal = () => {
    setIsModalOpen(false);
    refetch();
  };


  return (
    <div className="bg-[#1a1a1a] rounded-2xl shadow-md overflow-hidden border border-[#333] text-white">
<MediaRenderer
            client={client}
            src={nft.metadata.image}
            className="w-full rounded-t-2xl mb-4"
            />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        {description && <p className="text-sm text-gray-300 mb-3">{description}</p>}

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
      </div>
        
            <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        disabled={isSendLoading || isWaiting}
      >
        Transfer NFT
      </button>

      

      {/* Transfer Modal */}
      {isModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="p-12 rounded-lg w-96 relative text-black">

            {/* Modal content */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex flex-row justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                  Transfer NFT
                </h3>
                <button onClick={closeModal}><IoClose /></button>

                </div>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Enter recipient address"
                    value={transferAddress}
                    onChange={handleAddressChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                  onClick={onClickTransfer}
                  disabled={isSendLoading || isWaiting }
                >
                  {isSendLoading ? 'Transferring...' : isWaiting ? 'Waiting for confirmation...' : 'Transfer'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}