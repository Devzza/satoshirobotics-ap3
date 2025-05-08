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


const menuItems = [
  { id: "general", label: "General", icon: <SlGrid />},
  {
    id: "baseContract",
    label: "Base Contract",
    icon: <TbRobot />,
    children: [
      { id: "mechasCreated", label: "M3CH4s Created", icon: <AiOutlineRobot />},
      { id: "mechaphases", label: "Sale Phases", icon: <SlLayers  /> },
    ],
  },
  {
    id: "traitsContract",
    label: "Traits Contract",
    icon: <SlSocialSteam />,
    children: [
      { id: "lazyMint", label: "Create traits", icon: <AiOutlineRobot />},
      { id: "TraitsCreated", label: "Traits Created", icon: <AiOutlineRobot />},
      { id: "TraitsPhases", label: "Sale Phases", icon: <SlLayers  /> },
    ],
  },
  // Puedes añadir más secciones principales aquí si quieres
];

export default function Sidebar({
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
    {expanded && <h1 className="text-lg font-bold">Admin Panel</h1>}
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
          onClick={() =>
            item.children ? toggleSubmenu(item.id) : setSelected(item.id)
          }
          className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#1f1f1f] ${
            selected === item.id ? "bg-[#1f1f1f]" : ""
          }`}
        >
          <div className="flex items-center gap-4">
            {item.icon}
            {expanded && <span>{item.label}</span>}
          </div>
          {expanded && item.children && (
            <SlArrowDown
              className={`transition-transform ${
                openSubmenu === item.id ? "rotate-180" : ""
              }`}
            />
          )}
        </div>

        {/* Submenu */}
        {item.children && openSubmenu === item.id && expanded && (
          <ul className="ml-8">
            {item.children.map((subItem) => (
              <li
                key={subItem.id}
                onClick={() => setSelected(subItem.id)}
                className={`flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-[#1a1a1a] rounded ${
                  selected === subItem.id ? "bg-[#1a1a1a]" : ""
                }`}
              >
                {subItem.icon}
                <span>{subItem.label}</span>
              </li>
            ))}
          </ul>
        )}
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
