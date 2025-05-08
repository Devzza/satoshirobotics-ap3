import { defineChain } from "thirdweb";
import { polygonAmoy } from "thirdweb/chains";
import { curtis } from "./curtis";
import { apechain } from "./apechain";

//export const chain = defineChain ( polygonAmoy );
export const chain = defineChain ( curtis );
//export const chain = defineChain ( apechain );