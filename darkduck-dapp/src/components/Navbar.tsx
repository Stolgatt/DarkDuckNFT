'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";

export default function Navbar() {
  const [isOwner, setIsOwner] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    async function checkOwner() {
      try {
        if (typeof window !== "undefined" && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const contract = getContract(provider);
          const owner = await contract.owner();
  
          setWalletAddress(address);
          setIsOwner(address.toLowerCase() === owner.toLowerCase());
        }
      } catch (err) {
        console.warn("Failed to determine owner status:", err);
        setIsOwner(false);
      }
    }
  
    checkOwner();
  }, []);

  return (
    <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">DarkDuck NFT</h1>
      {walletAddress && (
        <span className="text-sm text-gray-400 ml-4">
          Connected with: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
        </span>
      )}

      <nav>
        {isOwner && (
            <Link href="/admin" className="mr-4 hover:underline">
              Admin
            </Link>
        )}
        <Link href="/" className="mr-4 hover:underline">Gallery</Link>
        <Link href="/myDDNFTs" className="mr-4 hover:underline">My Ducks</Link>
        <Link href="/marketplace" className="mr-4 hover:underline">Marketplace</Link>
        <Link href="/about" className="mr-8 hover:underline">About</Link>
        <Link href="/mint" className="mr-2 bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-white">
          Create NFT
        </Link>
      </nav>
    </header>
  );
}
