import { defineChain } from "thirdweb/chains";

export const apechain= defineChain({
  id: 33139, // ID de ApeChain
  name: "ApeChain",
  nativeCurrency: {
    name: "ApeCoin",
    symbol: "APE",
    decimals: 18,
  },
  rpc: "https://rpc.apechain.com", // Asegúrate de usar un RPC válido
  blockExplorers: [
    {
      name: "ApeScan",
      url: "https://apescan.io",
    },
  ],
  // testnet: false, // Cambia a true si es una testnet
});

