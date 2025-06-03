import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { getContract } from "thirdweb";

const baseAddress = "0x13a7c70FB0c2bD3BB28b360fA22DDEBDaC76cc1C";
const traitsAddress = "0xebc2774899b38f3dc22c4dfeb5b614515850cf04";
//const capsulesAddress = "";
//const capsDistroAddress = "";

export const BASE_CONTRACT = getContract({
    client: client,
    chain: chain,
    address: baseAddress,
});

export const TRAITS_CONTRACT = getContract({
    client: client,
    chain: chain,
    address: traitsAddress,
});
/*
export const CAPSULES_CONTRACT = getContract({
    client: client,
    chain: chain,
    address: capsulesAddress,
});

export const DISTRO_CONTRACT = getContract({
    client: client,
    chain: chain,
    address: capsDistroAddress,
});
*/


export const AdminAddress = "0xF3Aa7bA9BD5d546100dD6D4d9875d7CE43A0de82"
