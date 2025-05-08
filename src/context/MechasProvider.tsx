'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getNFTs, ownerOf, totalSupply } from "thirdweb/extensions/erc721";
import { NFT } from "thirdweb";
import { BASE_CONTRACT } from "../../constants/addresses";

// Tipo del contexto
interface MechasContextType {
  ownedNFTs: NFT[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const MechasContext = createContext<MechasContextType | undefined>(undefined);

export const MechasProvider = ({ children }: { children: React.ReactNode }) => {
  const account = useActiveAccount();

  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getOwnedNFTs = async () => {
    if (!account?.address) return;

    setIsLoading(true);
    let ownedNFTs: NFT[] = [];

    try {
      const currentAddress = account.address;
      const totalNFTSupply = await totalSupply({ contract: BASE_CONTRACT });
      const totalSupplyBigInt = BigInt(totalNFTSupply.toString());

      const ownerPromises = [];
      for (let tokenId = BigInt(0); tokenId < totalSupplyBigInt; tokenId++) {
        ownerPromises.push(
          ownerOf({
            contract: BASE_CONTRACT,
            tokenId,
          })
            .then((owner) => ({ tokenId, owner }))
            .catch((error) => {
              if (process.env.NODE_ENV === "development") {
                console.error(`Error fetching owner for token ${tokenId}:`, error);
              }
              return null;
            })
        );
      }

      const owners = await Promise.all(ownerPromises);

      const ownedTokenIds = owners
        .filter((result) => result && result.owner.toLowerCase() === currentAddress.toLowerCase())
        .map((result) => Number(result!.tokenId));

      if (ownedTokenIds.length === 0) {
        setOwnedNFTs([]);
        setIsLoading(false);
        return;
      }

      const metadataPromises = ownedTokenIds.map((tokenId) =>
        getNFTs({
          contract: BASE_CONTRACT,
          start: tokenId,
          count: 1,
        })
          .then((nfts) => nfts[0])
          .catch((error) => {
            if (process.env.NODE_ENV === "development") {
              console.error(`Error fetching metadata for token ${tokenId}:`, error);
            }
            return null;
          })
      );

      const metadataResults = await Promise.all(metadataPromises);
      ownedNFTs = metadataResults.filter((nft): nft is NFT => nft !== null);

      // Verifica que no haya cambiado la cuenta durante la carga
      if (account?.address === currentAddress) {
        setOwnedNFTs(ownedNFTs);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching NFTs:", error);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    getOwnedNFTs();
  }, [account]);

  return (
    <MechasContext.Provider value={{ ownedNFTs, isLoading, refetch: getOwnedNFTs }}>
      {children}
    </MechasContext.Provider>
  );
};

export const useMechas = (): MechasContextType => {
  const context = useContext(MechasContext);
  if (!context) {
    throw new Error("useMechas must be used within a MechasProvider");
  }
  return context;
};
