'use client';

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";
import NFTCard from "./NFTCards";

type NFTInfo = {
  tokenId: number;
  tokenURI: string;
  owner: string;
  isForSale: boolean;
  price?: string;
  showBuyButton?: boolean;
  showActions?: boolean;
  context?: "global" | "personal" | "marketplace";
};

export default function NFTGallery() {
  const [nfts, setNFTs] = useState<NFTInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNFTs() {
      try {
        if (!window.ethereum) return;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = getContract(provider);
        let lastTokenId = 0;
        
        try {
          lastTokenId = await contract.getLastTokenId();
        } catch (err) {
          console.error("Contract not reachable or incompatible:", err);
          setError("Could not connect to the contract. Please refresh or verify network.");
          return;
        }
        
        const results: NFTInfo[] = [];

        for (let id = 1; id <= lastTokenId; id++) {
          try {
            const tokenURI = await contract.tokenURI(id);
            const owner = await contract.ownerOf(id);
            const listing = await contract.listings(id);

            results.push({
              tokenId: id,
              tokenURI,
              owner,
              isForSale: listing.isForSale,
              price: listing.isForSale ? ethers.formatEther(listing.price) : undefined,
              showBuyButton: false,
              showActions: false,
              context: "global",
            });
          } catch (err){
            console.warn('Failed to load token #${id}', err);
          }
        }

        setNFTs(results);
      } catch (err) {
        console.warn("Failed to load NFTs", err);
        setError("Something went wrong while loading NFTs. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    loadNFTs();
  }, []);

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-4">All DarkDuck NFTs</h2>

      {error && (
        <div className="text-red-500 bg-red-100 p-3 rounded mb-4 max-w-xl">
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading NFTs...</p>
      ) : nfts.length === 0 ? (
        <p>No NFTs found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {nfts.map((nft) => (
            <NFTCard
              key={nft.tokenId}
              tokenId={nft.tokenId}
              tokenURI={nft.tokenURI}
              owner={nft.owner}
              price={nft.price}
              isForSale={nft.isForSale}
              showBuyButton={nft.showBuyButton}
              showActions={nft.showActions}
              context={nft.context}
            />
          ))}
        </div>
      )}
    </section>
  );
}
