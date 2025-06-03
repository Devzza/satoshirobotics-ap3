'use client'

import Image from "next/image";
import Link from "next/link";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "../client";
import { createWallet } from "thirdweb/wallets";
import { HiMenuAlt1 } from "react-icons/hi";
import { useState } from "react";
import { PiHandEye } from "react-icons/pi";
import { chain } from "../chain";
import { AdminAddress } from "../../../constants/addresses";


export default function Navbar() {
    const account = useActiveAccount();
    const adminAddress = AdminAddress; // Cambia esto por tu dirección de wallet

    const wallets = [
            createWallet("io.metamask"),
            createWallet("com.coinbase.wallet"),
            createWallet("me.rainbow"),
            createWallet("io.rabby"),
            createWallet("app.phantom"),
        ];

        const [isOpen, setIsOpen] = useState(false);

        const toggleMenu = () => {
          setIsOpen(!isOpen);
        };
      
        const closeMenu = () => {
          setIsOpen(false);
        };

    return (
        <nav className="flex justify-between items-center px-8 items-center py-6">
            <section className="flex items-center gap-4">

                {/* Hamburguesa */}
                <HiMenuAlt1 className="text-3xl text-white sm:hidden cursor-pointer" onClick={toggleMenu} />
                {/* Logo */}
                <Link href={"/"}>
                    <Image
                        src="/m3ch4-logo.svg"
                        alt="Logo"
                        width={50}
                        height={50}
                        priority />
                </Link>
            </section>

             {/* Menú grande */}
          <div className="flex flex-row items-center space-x-6 font-lexend font-bold text-white">
              <div className="hidden sm:block flex flex-row items-center justify-center space-x-6 font-lexend font-bold">
              
              <a href="/">
                      Home
                  </a>
                  <a href="/mint">
                      Mint
                  </a>
                  <a href="/profile">
                      Profile
                  </a>
                  {/*
                  <a href="/canvas">
                      Build robot
                  </a>
                  */}
                  <a
            href="https://boredonchain.gitbook.io/satoshi-robotics-docs"
          target="_blank"
          rel="noopener noreferrer"
        >
         
          Docs →
        </a>
        
        
                  {account?.address === adminAddress && (
                  <a href="/admin">
                      Dashboard
                  </a>
                  )}
              </div>
              <div>
              <ConnectButton 
                client={client} 
                wallets={wallets} 
                connectModal={{ 
                    size: "compact", 
                    showThirdwebBranding: false 
                }}
                detailsButton={{
                    style: {
                        maxHeight: "50px",
                    }
                }} 
                />
                </div>
          </div>

          {/* Fondo oscuro */}
          {isOpen && (
              <div
                  className="fixed inset-0 lg:hidden bg-black/50 backdrop-blur-sm z-40"
                  onClick={closeMenu}
              ></div>
          )}


          {/* Menú deslizable */}
          <div
              className={`fixed lg:hidden flex flex-col justify-between top-0 left-0 w-64 h-full bg-black z-50 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out`}
          >

              {/*arriba*/}
              <div>
                  <div className="flex items-center justify-between px-4 py-4">
{/* Logo */}
                <Link href={"/"}>
                    <Image
                        src="/m3ch4-logo.svg"
                        alt="Logo"
                        width={50}
                        height={50}
                        priority />
                </Link>
                                      <button
                          onClick={toggleMenu}
                          className="text-white hover:text-gray-400 focus:outline-none focus:text-white"
                      >
                          <svg
                              className="h-6 w-6"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                          >
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                  </div>
                  <div className="mt-4 space-y-4">
                      <div className="flex flex-col justify-center items-center font-lexend">
                      <ConnectButton 
                client={client} 
                wallets={wallets} 
                connectModal={{ 
                    size: "compact", 
                    showThirdwebBranding: false 
                }}
                detailsButton={{
                    style: {
                        maxHeight: "50px",
                    }
                }} 
                />
                  </div>
                  
                  <Link href={'/'}>
                <p className="rounded-md px-3 py-2 text-sm font-medium text-white">Home</p>
                </Link>
                <Link href={'/mint'}>
                <p className="rounded-md px-3 py-2 text-sm font-medium text-white">Mint</p>
                </Link>
                <Link href={'/profile'}>
                <p className="rounded-md px-3 py-2 text-sm font-medium text-white">Profile</p>
                </Link>
                {/*
                <Link href={'/canvas'}>
                <p className="rounded-md px-3 py-2 text-sm font-medium text-slate-700">Build robot</p>
                </Link>
                */}
                <Link href={'https://boredonchain.gitbook.io/satoshi-robotics-docs'}>
                <p className="rounded-md px-3 py-2 text-sm font-medium text-white">Docs →</p>
                </Link>
                {account?.address === adminAddress && (
                    <Link href={'/admin'}>
                        <p className="rounded-md px-3 py-2 text-sm font-medium text-white">Dashboard</p>
                    </Link>
                )}
                  </div>
              </div>

              {/*abajo*/}

              <div className="flex flex-row justify-center items-center mb-10 gap-6">

                  <a
                      href="https://discord.gg/2YEfWm4dXR"
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                      <Image
                          aria-hidden
                          src="/discord.svg"
                          alt="discord logo"
                          width={24}
                          height={24} />
                  </a>
                  <a
                      href="https://x.com/satoshirobotics"
                      target="_blank"
                      rel="noopener noreferrer"
                  >
                      <Image
                          aria-hidden
                          src="/x-logo.svg"
                          alt="x logo"
                          width={24}
                          height={24} />
                  </a>
              </div>

          </div>

        </nav>
    )
}