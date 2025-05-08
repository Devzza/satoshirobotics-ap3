import { useState } from "react";
import { TraitsCard } from "./OwnedTraits";
import { MediaRenderer } from "thirdweb/react";
import { client } from "../client";

interface TraitSectionProps {
    title: string;
    traits: any[];
    contract: any;
    onSelectTrait: (trait: any) => void;
  }

  const TraitSection: React.FC<TraitSectionProps> = ({ title, traits, contract, onSelectTrait }) => {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="grid grid-cols-2 gap-4">
          {traits.map((trait) => (
            <div
              key={trait.id}
              className="p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
              onClick={() => onSelectTrait(trait)}
            >
              <MediaRenderer
                client={client}
                src={trait.metadata.thumbnail}
                className="w-full h-32 object-cover mb-2"
              />
              <p className="text-center font-medium">{trait.metadata.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

export default TraitSection;
