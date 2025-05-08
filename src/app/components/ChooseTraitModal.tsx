interface ChooseTraitModalProps {
    isOpen: boolean;
    onClose: () => void;
    traitType: string | number | null; // Cambiado a permitir number y null
    ownedTraits: any[];
  }
  
  const ChooseTraitModal: React.FC<ChooseTraitModalProps> = ({
    isOpen,
    onClose,
    traitType,
    ownedTraits,
  }) => {
    if (!isOpen) return null;
  
    // Filtramos los ownedTraits por el tipo seleccionado
    const filteredTraits = ownedTraits.filter(
      (trait) => trait.metadata.layer_type === traitType
    );
  
    const equipTrait = (traitId: string) => {
      console.log(`Equipping trait with ID: ${traitId}`);
    };
  
    return (
      <div className="modal">
        <h2>Choose Trait for Slot {traitType}</h2>
  
        {filteredTraits.length > 0 ? (
          filteredTraits.map((trait) => (
            <div key={trait.id}>
              <p>Trait ID: {trait.id}</p>
              <button onClick={() => equipTrait(trait.id)}>Equip</button>
            </div>
          ))
        ) : (
          <p>No traits available for this slot.</p>
        )}
  
        <button onClick={onClose}>Close</button>
      </div>
    );
  };

  export default ChooseTraitModal;
