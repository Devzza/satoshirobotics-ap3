import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { getContract } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import { getTotalClaimedSupply, nextTokenIdToMint } from "thirdweb/extensions/erc721";
import { useReadContract, MediaRenderer } from "thirdweb/react";
import { BASE_CONTRACT, TRAITS_CONTRACT } from "../../../../constants/addresses";

export default function General() {
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
    
      const { data: contractMetadata, isLoading: isContractMetadataLoading } =
        useReadContract(getContractMetadata, {
          contract: baseContract,
        });
    
              const { data: claimedSupply, isLoading: isClaimSupplyLoading } = useReadContract( getTotalClaimedSupply,
                  { contract: baseContract}
              );
          
              const { data: totalNFTSupply, isLoading: isTotalSupplyLoading } = useReadContract( nextTokenIdToMint,
                  { contract: baseContract}
              );
    
        // Serve as a total tokens created (quantity)
      const { data: nextTokenToMint, isPending: loadingNextTokenToMint } = useReadContract({
        contract: traitsContract,
        method:
        "function nextTokenIdToMint() view returns (uint256)",
        params: [],
      });


    return (
<div className="p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between mt-6">
              {/* Left Side */}
              <div className="flex flex-col lg:flex-row justify-start items-center">
                <MediaRenderer
                  client={client}
                  src={contractMetadata?.image}
                  style={{
                    borderRadius: "15px",
                    width: "100px",
                    height: "100px",
                    marginBottom: "20px",
                    marginRight: "20px",
                    border: "2px solid white",
                  }}
                />
                <div>
                  <h1 className="text-white text-[42px] font-bold">
                    {contractMetadata?.name}
                  </h1>
                  <p className="text-gray-400">
                    M3CH4S:{" "}
                    <a
                      href={`https://amoy.polygonscan.com/address/${baseContract.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-200 hover:text-white cursor-pointer"
                    >
                      <span>{baseContract.address}</span>{" "}
                      <FaArrowUpRightFromSquare className="inline-block" />
                    </a>
                  </p>
                  <p className="text-gray-400">Traits:{" "}
                    <a
                      href={`https://amoy.polygonscan.com/address/${traitsContract.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-200 hover:text-white cursor-pointer"
                    >
                      <span>{traitsContract.address}</span>{" "}
                      <FaArrowUpRightFromSquare className="inline-block" />
                    </a>
                  </p>
                </div>
              </div>

              {/* Right Side */}
              <div className="relative inline-flex items-center justify-start gap-4 mt-4">
              <button className="bg-[#1a1a1a] border border-[#333] hover:bg-[#2a2a2a] text-white px-4 py-2 rounded-lg shadow-md transition-all">
  Download ▼
</button>
              </div>
            </div>

            {/* div for cards */}
            
            
                                  <div className="flex flex-col lg:flex-row items-center w-full space-y-4 lg:space-y-0 lg:space-x-4 mt-[35px] mb-[50px]">
            
            {/*Card 1*/}
            <div className="flex flex-col bg-[#121212] border border-[#1f1f1f] rounded-3xl w-full lg:w-1/2  font-lexend">
              <div className="px-6 py-8 sm:p-10 sm:pb-6">
                <div className="grid items-center justify-center w-full grid-cols-1 text-left">
                  <div>
                    <h2
                      className="text-lg font-medium tracking-tighter text-white lg:text-3xl"
                    >
                      NFTs minted
                    </h2>
                  </div>
                  <div className="mt-6">
                  <p>
                <span className="text-5xl font-light tracking-tight text-white">
                {claimedSupply?.toString()}
                </span>
                <span className="text-base font-medium text-white"> / {totalNFTSupply?.toString()} </span>
              </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/*Card 2*/}
            <div className="flex flex-col bg-[#121212] border border-[#1f1f1f] rounded-3xl w-full lg:w-1/2  font-lexend">
              <div className="px-6 py-8 sm:p-10 sm:pb-6">
                <div className="grid items-center justify-center w-full grid-cols-1 text-left">
                  <div>
                    <h2
                      className="text-lg font-medium tracking-tighter text-white lg:text-3xl"
                    >
                      Total traits
                    </h2>
                  </div>
                  <div className="mt-6">
      
  {loadingNextTokenToMint ? (
    <div className="flex items-center justify-center min-h-[2.5rem]">
    <span className="w-10 h-10 border-4 border-t-blue-500 text-white rounded-full animate-spin"></span></div>
  ) : (
    <p>
      <span className="text-5xl font-light tracking-tight text-white">{loadingNextTokenToMint ? "Cargando..." : nextTokenToMint !== undefined ? nextTokenToMint.toString() : "0"}</span>
      <span className="text-base font-medium text-white ml-2">ROBOT PARTS</span>
    </p>
  )}
      </div>
    </div>
                </div>
                </div>
            
            {/*Card 3*/}
            <div className="flex flex-col bg-[#121212] border border-[#1f1f1f] rounded-3xl w-full lg:w-1/2  font-lexend">
              <div className="px-6 py-8 sm:p-10 sm:pb-6">
                <div className="grid items-center justify-center w-full grid-cols-1 text-left">
                  <div>
                    <h2
                      className="text-lg font-medium tracking-tighter text-white lg:text-3xl"
                    >
                      Total holders
                    </h2>
                  </div>
                  <div className="mt-6">
                  <p>
                <span className="text-base font-medium text-white">
                  Not defined
                </span>
              </p>
                  </div>
                </div>
              </div>
            </div>
            
            
            
            
            </div>
                              {/* ^^^ End div for cards ^^^ */}



            <div className="p-6 bg-[#121212] rounded-xl shadow-lg border border-[#1f1f1f] my-8">
          <h1 className="text-white font-bold text-xl">Hola Admin</h1>
          </div>

          </div>
    );
  }
  