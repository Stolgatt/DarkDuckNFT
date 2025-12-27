'use client';

import { useEffect, useState } from "react";
import { ethers } from "ethers";

type Props = {
  tokenId: number;
  contract: any;
  owner?: string;
  connectedAccount: string;
  isForSale?: boolean;
  totalPrice: string;
};

export default function BuyButton({
  tokenId,
  contract,
  owner,
  connectedAccount,
  isForSale,
  totalPrice,
}: Props) {
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkAvailability() {
      if (!contract || !isForSale || !connectedAccount) {
        setAvailable(false);
        return;
      }

      try {
        const currentOwner = await contract.ownerOf(tokenId);
        const listing = await contract.listings(tokenId);
        setAvailable(
          currentOwner.toLowerCase() !== connectedAccount.toLowerCase() &&
          listing.isForSale
        );
      } catch (err) {
        console.warn("Check failed", err);
        setAvailable(false);
      }
    }

    checkAvailability();
  }, [contract, tokenId, connectedAccount, isForSale]);

  async function handleBuy() {
    try {
      setLoading(true);
      const value = ethers.parseEther(totalPrice);
      const tx = await contract.buyDDNFT(tokenId, { value });
      await tx.wait();
      window.location.reload();
    } catch (err: any) {
      if (err.code === "ACTION_REJECTED" || err?.info?.error?.code === 4001) {
        alert("Transaction cancelled by user.");
      } else {
        console.error("Transaction failed:", err);
        alert("Transaction failed. See console for details.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!available || !connectedAccount) return null;

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className={`mt-3 px-3 py-1 w-full rounded text-white ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {loading ? "Processing..." : `Buy for ${totalPrice} ETH`}
    </button>
  );
}
