import { client } from "@/app/client";
import { NFT } from "thirdweb"
import { MediaRenderer } from "thirdweb/react";



export interface OwnedSimiansProps {
  nft: NFT;
  driverName: string;
}

export const OwnedSimians = ({ nft, driverName }: OwnedSimiansProps) => {

    return (

        <div
        className="cursor-pointer"
      >
<MediaRenderer
                client={client}
                src={nft.metadata.image}
                className="border-4 border-solid border-[#000000]"
            style={{borderRadius: "15px", width: "200px", height: "200px", marginBottom: "20px"}} />    
                    
            
            <p>{nft.metadata.name}</p>
            </div>

       
                
           
    )
}
