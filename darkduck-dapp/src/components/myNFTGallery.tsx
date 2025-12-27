'use client';

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";
import NFTCard from "@/components/NFTCards";

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

export default function myNFTGallery() {
  const [nfts, setNFTs] = useState<NFTInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function loadNFTs() {
      try {
        if (!window.ethereum) return;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        
        const contract = getContract(provider);

        const lastTokenId = await contract.getLastTokenId();
        const results: NFTInfo[] = [];

        for (let id = 1; id <= lastTokenId; id++) {
          try {
            const tokenURI = await contract.tokenURI(id);
            const owner = await contract.ownerOf(id);
            const listing = await contract.listings(id);
            if (userAddress.toLowerCase() === owner.toLowerCase()) {
                results.push({
                tokenId: id,
                tokenURI,
                owner,
                isForSale: listing.isForSale,
                price: listing.isForSale ? ethers.formatEther(listing.price) : undefined,
                showBuyButton: false,
                showActions: true,
                context: "personal",
                });
            }
          } catch (err) {
            console.warn(`Could not fetch token ${id}:`, err);
          }          
        }

        setNFTs(results);
      } catch (err) {
        console.error("Failed to load NFTs", err);
        setError("Failed to load your NFTs. Please check your wallet connection or refresh.");
      } finally {
        setLoading(false);
      }
    }
    loadNFTs();
  }, []);

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-4">All DarkDuck NFTs</h2>

      {loading ? (
        <p>Loading NFTs...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : nfts.length === 0 ? (
        <p>You don't own any NFTs yet.</p>
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
