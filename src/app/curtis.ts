import { defineChain } from "thirdweb/chains";

export const curtis= defineChain({
  id: 33111, // ID de ApeChain
  name: "Curtis",
  nativeCurrency: {
    name: "ApeCoin",
    symbol: "APE",
    decimals: 18,
  },
  rpc: "https://curtis.rpc.caldera.xyz/http", // Asegúrate de usar un RPC válido
  blockExplorers: [
    {
      name: "ApeScan",
      url: "https://curtis.explorer.caldera.xyz/",
    },
  ],
  // testnet: false, // Cambia a true si es una testnet
});

