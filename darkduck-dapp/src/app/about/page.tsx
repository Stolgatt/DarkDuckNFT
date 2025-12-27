'use client';

import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="p-6 max-w-3xl mx-auto text-center">
        <h1 className="mt-8 text-4xl font-bold mb-6 text-gray-100">About DarkDuck</h1>

        <p className="text-lg text-gray-300 mb-4">
          <strong>DarkDuck</strong> is a decentralized NFT platform built as part of an educational blockchain project.
          It allows users to mint, own, sell, and transfer unique duck-themed digital collectibles.
        </p>

        <p className="text-gray-300 mb-4">
          This dApp (Decentralized Application) was developed using Solidity, Hardhat, and Next.js with Ethers.js integration.
          The smart contract follows the ERC-721 standard to ensure compatibility with major NFT marketplaces.
        </p>

        <p className="text-gray-300 mb-4">
          Currently, only the contract owner can mint new DarkDuck NFTs. Once minted, NFTs can be listed for sale,
          purchased by others, and freely transferred.
        </p>

        <p className="text-gray-300 mb-4">
          This project was created as part of a university course on blockchain technologies, and demonstrates
          a full-stack Web3 development workflow.
        </p>

        <div className="mt-20 text-sm text-gray-400">
          <p>Developed by Alexis Chavy</p>
          <p>Supervised by François Charoy — Telecom Nancy</p>
          <p>Project 2025 - Educational use</p>
        </div>
      </main>
    </>
  );
}
