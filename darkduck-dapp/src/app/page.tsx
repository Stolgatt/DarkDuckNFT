'use client';

import { useState, useEffect } from "react";
import ConnectWallet from "@/components/ConnectWallet";
import Navbar from "../components/Navbar";
import NFTGallery from "../components/NFTGallery";

// Connection Component  
function WalletConnectionSection() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsConnected(true);
          setWalletAddress(accounts[0]);
        }
      }
    };

    checkWalletConnection();
  }, []);

  if (!isConnected) {
    return (
      <>
        <section className="ml-8 mb-4">
          <p className="mb-4">Please connect your wallet to get access to your account</p>
          <ConnectWallet
            onConnected={(address: string) => {
              setIsConnected(true);
              setWalletAddress(address);
            }}
          />
        </section>
      </>
    );
  }

  return (
    <p className="ml-8 mb-4">
      <span className="font-bold">Your connected wallet address:</span> {walletAddress}
    </p>
  );
}

// Main component
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="p-6">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-extrabold tracking-tight text-gray-100 mb-4">
            DarkDuck NFT Gallery
          </h2>
          <p className="text-lg text-blue-300 mb-1">
            Explore the collection of DarkDuck NFTs.
          </p>
          <p className="text-lg text-blue-300 mb-1">
            Buy, sell and transfer DarkDuck NFTs to other users!
          </p>
          <p className="text-lg text-blue-300">
            Enjoy the ducky experience.
          </p>
        </div>

        <section className="mb-4">
          <WalletConnectionSection />
        </section>

        <NFTGallery />
      </main>
    </>
  );
}
