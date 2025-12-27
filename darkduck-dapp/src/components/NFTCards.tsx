'use client';

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";
import NFTActionModal from "@/components/NFTActionModal";

interface NFTCardProps {
  tokenId: number;
  tokenURI: string;
  owner?: string;
  price?: string;
  isForSale?: boolean;
  showBuyButton?: boolean;
  showActions?: boolean;
  context?: "global" | "personal" | "marketplace";
}

interface Metadata {
  name: string;
  description: string;
  image: string;
}

export default function NFTCard({ tokenId, tokenURI, owner, price, isForSale, showBuyButton, showActions, context }: NFTCardProps) {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [platformFee, setPlatformFee] = useState<number>(0.1);
  const [status, setStatus] = useState<string>("");
  const [contract, setContract] = useState<any>(null);
  const [available, setAvailable] = useState<boolean>(false);

  function convertIPFSToHTTP(uri: string): string {
    if (uri.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${uri.substring(7)}`;
    }
    return uri;
  }

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await fetch(convertIPFSToHTTP(tokenURI));
        if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.warn(`Metadata fetch failed for token ${tokenId}: ${err instanceof Error ? err.message : err}`);
        setError(true);
      }
    }
    fetchMetadata();
  }, [tokenURI, tokenId]);

  useEffect(() => {
    async function init() {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setConnectedAccount(await signer.getAddress());
      const c = getContract(provider);
      setContract(c);
      try {
        const fee = await c.getPlatformFee();
        setPlatformFee(Number(fee) / 10000);
      } catch (e) {
        console.error("Could not fetch platform fee", e);
      }
    }
    init();
  }, []);

  useEffect(() => {
    async function verifyAvailability() {
      if (!contract || !connectedAccount || !isForSale) return;
      try {
        const currentOwner = await contract.ownerOf(tokenId);
        const listing = await contract.listings(tokenId);
        setAvailable(
          listing.isForSale && currentOwner.toLowerCase() !== connectedAccount.toLowerCase()
        );
      } catch (err) {
        console.warn("Availability check failed", err);
      }
    }
    verifyAvailability();
  }, [contract, connectedAccount, tokenId, isForSale]);

  const priceNumber = price ? parseFloat(price) : 0;
  const totalPrice = (priceNumber * (1 + platformFee)).toFixed(4);

  async function handleBuy() {
    if (!window.ethereum || !totalPrice || !contract) return;
    if (!window.confirm(`Are you sure you want to buy this NFT for ${totalPrice} ETH?`)) return;

    try {
      const signer = await new ethers.BrowserProvider(window.ethereum).getSigner();
      const c = getContract(signer);
      const tx = await c.buyDDNFT(tokenId, { value: ethers.parseEther(totalPrice) });
      await tx.wait();
      window.location.reload();
    } catch (err: any) {
      if (err?.code === "ACTION_REJECTED" || err?.info?.error?.code === 4001) {
        setStatus("Transaction cancelled by user.");
      } else {
        console.error("Transaction failed:", err);
        setStatus("Transaction failed. Please try again or check your wallet.");
      }
    }
  }

  if (!metadata && !error) {
    return (
      <div className="border rounded p-4 w-60 bg-gray-50 text-gray-600 shadow-sm">
        <p>Loading token #{tokenId}...</p>
        <p className="text-xs text-gray-500 break-all">URI: {tokenURI}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded p-4 w-60 bg-red-50 shadow-sm">
        <p className="mb-4 text-red-700 font-semibold">Failed to load metadata</p>
        <p className="text-xs text-gray-600 break-all">URI: {tokenURI}</p>

        {connectedAccount && context === "personal" && (
          <button
            onClick={async () => {
              if (!window.confirm(`Are you sure you want to delete token #${tokenId}?`)) return;
              try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contract = getContract(signer);
                const owner = await contract.owner();
                const user = await signer.getAddress();

                if (owner.toLowerCase() !== user.toLowerCase()) {
                  alert("Only the contract owner can delete NFTs.");
                  return;
                }

                const tx = await contract.burn(tokenId);
                await tx.wait();
                window.location.reload();
              } catch (err) {
                console.error("Failed to delete token", err);
                setStatus("Could not delete NFT.")
              }
            }}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete NFT
          </button>
        )}
      </div>
    );
  }

  if (!metadata) return null;

  return (
    <div className="relative border rounded p-4 w-60 shadow-sm bg-white">
      <img src={convertIPFSToHTTP(metadata.image)} alt={metadata.name} className="w-full rounded mb-2" />
      <h3 className="text-xl font-bold text-black">{metadata.name}</h3>
      <p className="text-sm text-gray-600">{metadata.description}</p>

      {context !== "global" && isForSale && price && (
        <p className="mt-2 text-green-600 font-semibold">
          {context === "personal" ? "On Sale – " : ""}Price: {totalPrice} ETH (incl. fees)
        </p>
      )}

      {owner && connectedAccount && owner.toLowerCase() === connectedAccount.toLowerCase() ? (
        <p className="mt-1 text-lg font-bold text-green-600">Owned</p>
      ) : owner && (
        <p className="mt-1 text-xs text-gray-400">Owner: {owner.slice(0, 6)}...{owner.slice(-4)}</p>
      )}

      {showBuyButton && available && (
        <button
          onClick={handleBuy}
          className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 w-full"
        >
          Buy for {totalPrice} ETH
        </button>
      )}

      {status && (
        <p className={`mt-2 text-sm font-medium ${
          status.toLowerCase().includes("success") ? "text-green-600" : "text-red-500"
        }`}>
          {status}
        </p>
      )}

      {showActions && (
        <button
          onClick={() => setShowModal(true)}
          className="absolute bottom-4 right-3 text-black hover:text-black text-xl"
          title="Actions"
        >
          &#x22EE;
        </button>
      )}

      {showModal && (
        <NFTActionModal
          tokenId={tokenId}
          isForSale={isForSale}
          onClose={() => setShowModal(false)}
          onList={() => {
            setShowModal(false);
          }}
          onTransfer={() => {
            setShowModal(false);
          }}
          onUnlist={async () => {
            try {
              if (!window.ethereum) return;
              const provider = new ethers.BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();
              const contract = getContract(signer);
              const tx = await contract.unlistFromSale(tokenId);
              await tx.wait();
              setShowModal(false);
              window.location.reload();
            } catch (err) {
              console.error("Failed to remove NFT from sale", err);
              setStatus("Could not remove NFT from sale.")
            }
          }}
          onOpenURI={() => window.open(convertIPFSToHTTP(tokenURI), "_blank")}
        />
      )}
    </div>
  );
}
