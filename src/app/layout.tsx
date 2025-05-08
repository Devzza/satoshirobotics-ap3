import type { Metadata } from "next";
import { Geist, Geist_Mono, Lexend, Orbitron } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "@/app/thirdweb";
import { MechasProvider } from "../context/MechasProvider";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Satoshi Robotics, Inc.",
  description: "Build your Robot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} ${orbitron.variable} font-lexend antialiased`}
      >
        <ThirdwebProvider>
          <MechasProvider>
            {children}
          </MechasProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
