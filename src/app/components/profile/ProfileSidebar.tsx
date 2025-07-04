import { useState } from "react";
import { AiOutlineRobot } from "react-icons/ai";
import Link from "next/link";
import Image from "next/image";
import { SlArrowDown, SlArrowLeftCircle, SlArrowRightCircle, SlGrid, SlLayers, SlSocialSteam } from "react-icons/sl";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { AdminAddress } from "../../../../constants/addresses";
import { client } from "@/app/client";
import { TbRobot } from "react-icons/tb";
import { IoCloseOutline } from "react-icons/io5";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { BiMicrochip } from "react-icons/bi";



const menuItems = [
  { id: "ownedCores", label: "Robots", icon: <TbRobot />},
  { id: "ownedCaps", label: "Capsules", icon: <BiMicrochip />},
  { id: "ownedParts", label: "Parts", icon: <SlSocialSteam />},
  // Puedes añadir más secciones principales aquí si quieres
];

export default function ProfileSidebar({
  selected,
  setSelected,
  showMobile,
  onCloseMobile,
}: {
  selected: string;
  setSelected: (value: string) => void;
  showMobile?: boolean;
  onCloseMobile?: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (id: string) => {
    setOpenSubmenu(openSubmenu === id ? null : id);
  };

  const account = useActiveAccount();
      const adminAddress = AdminAddress; // Cambia esto por tu dirección de wallet
  
      const wallets = [
              createWallet("io.metamask"),
              createWallet("com.coinbase.wallet"),
              createWallet("me.rainbow"),
              createWallet("io.rabby"),
              createWallet("app.phantom"),
          ];

  return (
<div
  className={`
    min-h-screen bg-[#121212] border-r border-[#1f1f1f] transition-all duration-300 z-40
    fixed top-0 left-0 
    ${showMobile ? "w-64" : "hidden"}
    md:static md:block ${expanded ? "md:w-64" : "md:w-16"}
  `}
>
  <div className="flex flex-col h-full justify-between">
    <div>
  {/* Logo */}
  <div className="flex flex-col relative">
  {/* Botón de cerrar solo visible en móvil */}
  {showMobile && (
    <div className="flex justify-end pt-4 pr-4">
    <button
      onClick={onCloseMobile}
      className="cursor-pointer text-white text-3xl md:hidden"
    >
      <IoIosCloseCircleOutline  />
    </button>
    </div>
  )}
<div>
  <Link href={"/"}>
    <Image
      src="/m3ch4-logo.svg"
      alt="Logo"
      width={100}
      height={100}
      priority
      className="my-6 px-4"
    />
  </Link>
  </div>
</div>

  {/* Header */}
  <div className="flex justify-between items-center p-4 text-white">
    {expanded && <h1 className="text-lg font-bold">Profile</h1>}
    {/* Botón de expansión solo visible en desktop */}
<button
  onClick={() => setExpanded(!expanded)}
  className="cursor-pointer hidden md:block"
>
  {expanded ? <SlArrowLeftCircle /> : <SlArrowRightCircle />}
</button>
  </div>

  {/* Aquí continúa tu menú */}
  <ul className="text-white">
  {menuItems.map((item) => (
    <li key={item.id}>
      <div
        onClick={() => setSelected(item.id)}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1f1f1f] ${
          selected === item.id ? "bg-[#1f1f1f]" : ""
        }`}
      >
        <div className="flex items-center gap-4">
          {item.icon}
          {expanded && <span>{item.label}</span>}
        </div>
      </div>
    </li>
  ))}
</ul>
  </div>
  {expanded && 
  <div className="flex flex-col justify-center items-center my-6 w-full px-6">
    <ConnectButton 
                    client={client} 
                    wallets={wallets} 
                    connectModal={{ 
                        size: "compact", 
                        showThirdwebBranding: false 
                    }}
                    />
  </div>
  }
  </div>
</div>

  );
}
