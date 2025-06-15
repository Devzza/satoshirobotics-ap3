import { chain } from "@/app/chain";
import { client } from "@/app/client";
import { getContract } from "thirdweb";

const baseAddress = "0x13a7c70FB0c2bD3BB28b360fA22DDEBDaC76cc1C";
const traitsAddress = "0x38d70e523c4187934495d8aE556C2041809b1713";
const capsulesAddress = "0x36268223DB537C3B5A4f6145b1667881A6D5911B";
const capsDistroAddress = "0xB0Ba724CF8646363Dbc39B66dCB4b05803A5C3f3";

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
