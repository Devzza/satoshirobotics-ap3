import { useState } from 'react';
import { TRAITS_CONTRACT } from '../../../../constants/addresses';
import { useActiveAccount } from 'thirdweb/react';
import { prepareContractCall, sendTransaction } from 'thirdweb';

export default function LazyMintTrait() {
  const account = useActiveAccount();
  const [amount, setAmount] = useState(1);
  const [baseURI, setBaseURI] = useState('');
  const [data, setData] = useState('');
  const [maxSupply, setMaxSupply] = useState(0);
  const [traitType, setTraitType] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [creator, setCreator] = useState<string>('');
  const [feeBps, setFeeBps] = useState<number>(0); // basis points (100 = 1%)

  const traitOptions = [
    { label: 'Background (1)', value: 1 },
    { label: 'Back (2)', value: 2 },
    { label: 'Right Arm (3)', value: 3 },
    { label: 'Body (4)', value: 4 },
    { label: 'Left Arm (5)', value: 5 },
    { label: 'Right Leg (6)', value: 6 },
    { label: 'Left Leg (7)', value: 7 },
    { label: 'Head (8)', value: 8 },
    { label: 'Accessories (9)', value: 9 }
  ];

  const handleLazyMint = async () => {
    try {
      setIsLoading(true);

          // Verifica si 'account' está definido antes de enviar la transacción
    if (!account) {
      alert('You need to be connected to a wallet.');
      return;
    }

      const transaction = await prepareContractCall({
        contract: TRAITS_CONTRACT,
        method:
        "function lazyMint(uint256 _amount, string _baseURIForTokens, bytes _data, uint256 _maxSupply, uint256 _traitType, address _creator, uint96 _feeBps) returns (uint256 batchId)",
      params: [BigInt(amount), baseURI, '0x', BigInt(maxSupply), BigInt(traitType), creator, BigInt(feeBps)],
      });

      const { transactionHash } = await sendTransaction({
        transaction,
        account,  // Asegúrate de tener la cuenta del admin conectada
      });

      setTransactionHash(transactionHash);
      alert('Transaction Successful! Check the transaction hash: ' + transactionHash);
    } catch (error) {
      console.error(error);
      alert('Error occurred during the transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Create new traits</h2>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-4">
          <label htmlFor="amount" className="block font-medium">Amount</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-2 p-2 border border-gray-300 rounded"
            min="1"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="baseURI" className="block font-medium">Base URI for Tokens</label>
          <input
            id="baseURI"
            type="text"
            value={baseURI}
            onChange={(e) => setBaseURI(e.target.value)}
            className="mt-2 p-2 border border-gray-300 rounded"
            placeholder="ipfs://..."
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="maxSupply" className="block font-medium">Max Supply</label>
          <input
            id="maxSupply"
            type="number"
            value={maxSupply}
            onChange={(e) => setMaxSupply(Number(e.target.value))}
            className="mt-2 p-2 border border-gray-300 rounded"
            min="1"
            required
          />
        </div>

        <div className="mb-4">
  <label htmlFor="traitType" className="block font-medium">Trait Type</label>
  <select
    id="traitType"
    value={traitType}
    onChange={(e) => setTraitType(Number(e.target.value))}
    className="mt-2 p-2 border border-gray-300 rounded text-white"
    required
  >
    {traitOptions.map((option) => (
      <option key={option.value} value={option.value} className="text-black hover:text-black">
        {option.label}
      </option>
    ))}
  </select>
</div>

<div className="mb-4">
  <label htmlFor="creator" className="block font-medium">Creator Address</label>
  <input
    id="creator"
    type="text"
    value={creator}
    onChange={(e) => setCreator(e.target.value)}
    className="mt-2 p-2 border border-gray-300 rounded"
    placeholder="0x..."
    required
  />
</div>

<div className="mb-4">
  <label htmlFor="feeBps" className="block font-medium">Fee (Basis Points)</label>
  <input
    id="feeBps"
    type="number"
    value={feeBps}
    onChange={(e) => setFeeBps(Number(e.target.value))}
    className="mt-2 p-2 border border-gray-300 rounded"
    placeholder="Ej: 500 = 5%"
    min="0"
    max="10000"
    required
  />
</div>

        <button
          type="submit"
          onClick={handleLazyMint}
          className={`mt-4 p-2 bg-blue-500 text-white rounded cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Lazy Mint'}
        </button>
      </form>

      {transactionHash && (
        <div className="mt-4 text-sm text-gray-500">
          <p>Transaction Hash: <a href={`https://polygonscan.com/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">{transactionHash}</a></p>
        </div>
      )}
    </div>
  );
}
