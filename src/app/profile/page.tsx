'use client';

import { useRouter } from "next/navigation";
import {
  ConnectButton,
  MediaRenderer,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { client } from "../client";
import { chain } from "../chain";
import { createWallet } from "thirdweb/wallets";
import { useEffect, useState } from "react";
import { getContract } from "thirdweb";
import NavBar from "../components/NavBar";
import Link from "next/link";
import Image from "next/image";
import {
  BASE_CONTRACT,
  TRAITS_CONTRACT,
} from "../../../constants/addresses";
import { getContractMetadata } from "thirdweb/extensions/common";
import { FaArrowUpRightFromSquare, FaBars } from "react-icons/fa6";
import ProfileSidebar from "../components/profile/ProfileSidebar";
import OwnedCores from "../components/profile/OwnedCores";
import { SlMenu } from "react-icons/sl";
import { IoCloseOutline } from "react-icons/io5";
import TopBar from "../components/TopBar";



const Profile = () => {
  const wallets = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
    createWallet("io.rabby"),
    createWallet("app.phantom"),
  ];

  const account = useActiveAccount();

  


  // Sidebar

  const [selected, setSelected] = useState("general");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);


  const renderSection = () => {
    switch (selected) {
        case "ownedCores":
          return <OwnedCores />;
      default:
        return <OwnedCores />;
    }
  };



  return (
<section className="w-full min-h-screen bg-[#0d0d0d] text-[#e5e5e5] font-lexend">

      {/* No wallet connected */}
      {!account ? (
        <>
        <TopBar message="We recommend using the desktop version. We're still working on the mobile version for a better experience." backgroundColor="#0303d1" textColor="#fff" />
        <NavBar /><div className="flex flex-col items-center h-screen justify-center font-lexend">
          <h1 className="mb-[25px] text-lg">Connect your wallet</h1>
          <div className="mb-[150px]">
            <ConnectButton
              client={client}
              wallets={wallets}
              connectModal={{
                size: "compact",
                showThirdwebBranding: false,
              }} />
          </div>
        </div></>
      ) : (
       
<div className="w-full min-h-screen text-black font-lexend">
  {/* Botón hamburguesa solo visible en móviles */}
  <div className="md:hidden p-4 gap-4 flex flex-row items-center ">
    <button onClick={() => setShowMobileSidebar(true)} className="text-white text-2xl cursor-pointer">
      <SlMenu />
    </button>
      <Link href={"/"}>
        <Image
          src="/m3ch4-logo.svg"
          alt="Logo"
          width={50}
          height={50}
          priority
          className="my-6"
        />
      </Link>
  </div>

  <div className="flex bg-[#0d0d0d] text-white font-lexend">
    {/* Fondo oscuro cuando se abre el sidebar en móvil */}
    {showMobileSidebar && (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        onClick={() => setShowMobileSidebar(false)}
      />
    )}

    <ProfileSidebar
      selected={selected}
      setSelected={(id) => {
        setSelected(id);
        setShowMobileSidebar(false); // cerrar menú móvil al seleccionar
      }}
      showMobile={showMobileSidebar}
      onCloseMobile={() => setShowMobileSidebar(false)}
    />

    <main className="flex-1 p-6">{renderSection()}</main>
  </div>
</div>

      )}
    </section>
  );
};

export default Profile;
