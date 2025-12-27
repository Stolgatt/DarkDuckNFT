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

export default function Marketplace() {
  const [nfts, setNFTs] = useState<NFTInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNFTs() {
      try {
        if (!window.ethereum) return;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        
        const contract = getContract(provider);

        const lastTokenId = await contract.getLastTokenId();
        const nftPromises = [];

        for (let id = 1; id <= lastTokenId; id++) {
          nftPromises.push(
            (async () => {
              try {
                const tokenURI = await contract.tokenURI(id);
                const owner = await contract.ownerOf(id);
                const listing = await contract.listings(id);
                if (listing.isForSale) {
                  return {
                    tokenId: id,
                    tokenURI,
                    owner,
                    isForSale: true,
                    price: ethers.formatEther(listing.price),
                    showBuyButton: true,
                    showActions: false,
                    context: "marketplace",
                  } as NFTInfo;
                }
              } catch (err) {
                console.warn(`Failed to fetch data for token ID ${id}`, err);
              }
              return null;
            })()
          );
        }

        const resolvedNFTs = await Promise.all(nftPromises);
        const filteredNFTs = resolvedNFTs.filter((nft): nft is NFTInfo => nft !== null);

        setNFTs(filteredNFTs);

      } catch (err) {
        console.error("Failed to load NFTs", err);
      } finally {
        setLoading(false);
      }
    }

    loadNFTs();
  }, []);

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-4">All DarkDuck NFTs</h2>
  
      <button
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => window.location.reload()}
      >
        Refresh Marketplace
      </button>
  
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
