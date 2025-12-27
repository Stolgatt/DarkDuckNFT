'use client';

import { useState, useEffect } from "react";
import ConnectWallet from "@/components/ConnectWallet";
import Navbar from "@/components/Navbar";
import NFTGallery from "@/components/myNFTGallery";

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
            Your DarkDuck NFT Personnal Gallery
          </h2>
          <p className="text-lg text-blue-300 mb-1">
            You own all these ducks! Well Done!
          </p>
          <p className="text-lg text-blue-300 mb-1">
            Be careful with your ducks, they are unique and special.
          </p>
          <p className="text-lg text-blue-300 m-1">
            You can buy some more, sell them or give them as a gift if you want.
          </p>
          <p className="text-lg text-blue-300">
            Enjoy the ducky experience and don't forget to feed them!
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
