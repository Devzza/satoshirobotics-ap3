import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { getContract } from "thirdweb";

const baseAddress = "0xfdCcf5E9d767CCBc7f148cEc3CAA58A83DCa6712";
const traitsAddress = "0xd67ca7a9a480ba478c87b17acbdd76b15ae80836";
const capsulesAddress = "0x236fAF2A885088Da95297d12eC8804E89375629d";
const capsDistroAddress = "0xa0593Fed2dcECa48e14914369965B5068a476fD4";

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


export const AdminAddress = "0xF3Aa7bA9BD5d546100dD6D4d9875d7CE43A0de82"
