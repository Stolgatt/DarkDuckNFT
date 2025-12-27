'use client';

import React, { useEffect } from "react";
import { useState } from "react";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";


type NFTActionModalProps = {
  tokenId: number;
  isForSale?: boolean;
  onClose: () => void;
  onList?: () => void;
  onTransfer?: () => void;
  onUnlist?: () => void;
  onOpenURI?: () => void;
};


export default function NFTActionModal({
  tokenId,
  isForSale,
  onClose,
  onList,
  onTransfer,
  onUnlist,
  onOpenURI,
}: NFTActionModalProps) {
  const [showListForm, setShowListForm] = useState(false);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferAddress, setTransferAddress] = useState("");
  const [transferError, setTransferError] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Function to handle listing the NFT
  async function handleListing() {
    if (!window.ethereum) return;
  
    setError("");
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }
  
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
  
      const parsedPrice = ethers.parseEther(price);
      const tx = await contract.listForSale(tokenId, parsedPrice);
      await tx.wait();
  
      setShowListForm(false);
      setPrice("");
      onClose(); // Fermer le modal après succès
      window.location.reload(); // Met à jour la galerie
    } catch (err: any) {
      console.error(err);
      setError("Listing failed. Please try again, refresh the page or check your wallet.")
    } finally {
      setLoading(false);
    }
  }

  // Function to handle transfer
  async function handleTransfer() {
    if (!window.ethereum) return;
    if (!window.confirm(`Are you sure you want to transfer this NFT to ${transferAddress}?`)) return;
  
    setTransferError("");
  
    if (!ethers.isAddress(transferAddress)) {
      setTransferError("Please enter a valid Ethereum address.");
      return;
    }
  
    try {
      setTransferLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
  
      const tx = await contract.transferNFT(transferAddress, tokenId);
      await tx.wait();
  
      setTransferAddress("");
      setShowTransferForm(false);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setTransferError("Failed to transfer NFT.");
    } finally {
      setTransferLoading(false);
    }
  }
  
  
  // Function to render the listing form
  function renderListSection() {
    if (!showListForm) {
      return (
        <button
          onClick={() => setShowListForm(true)}
          className="w-full py-2 px-3 mb-2 bg-blue-600 text-white rounded hover:bg-gray-500"
        >
          List for Sale
        </button>
      );
    }
  
    return (
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter price in ETH"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2 text-black"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-between gap-2">
          <button
            onClick={() => setShowListForm(false)}
            className="w-1/2 py-2 bg-gray-500 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleListing}
            disabled={loading}
            className="w-1/2 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Listing..." : "Confirm"}
          </button>
        </div>
      </div>
    );
  }

  // Function to render the transfer form
  function renderTransferSection() {
    if (!showTransferForm) {
      return (
        <button
          onClick={() => setShowTransferForm(true)}
          className="w-full py-2 px-3 mb-2 bg-white text-black rounded hover:bg-gray-500"
        >
          Transfer NFT
        </button>
      );
    }
  
    return (
      <div className="mb-4">
        <input
          type="text"
          placeholder="Recipient address"
          value={transferAddress}
          onChange={(e) => setTransferAddress(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2 text-black"
        />
        {transferError && <p className="text-red-500 text-sm mb-2">{transferError}</p>}
        <div className="flex justify-between gap-2">
          <button
            onClick={() => setShowTransferForm(false)}
            className="w-1/2 py-2 bg-gray-500 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={transferLoading}
            className="w-1/2 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {transferLoading ? "Transferring..." : "Confirm"}
          </button>
        </div>
      </div>
    );
  }

  // Check if the user is the owner of the contract
  useEffect(() => {
    async function checkOwner() {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(provider);
      const user = await signer.getAddress();
      const owner = await contract.owner();
      setIsOwner(user.toLowerCase() === owner.toLowerCase());
    }
    checkOwner();
  }, []);
  

  // global return
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center">
      {(error || transferError || deleteError) && (
        <div className="mb-4 text-center text-sm text-red-500 mt-2">
          {error || transferError || deleteError}
        </div>
      )}

      <div className="bg-gray-300 p-6 rounded shadow-lg w-80 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-600"
        >
          ✕
        </button>
        <h3 className="text-black font-bold text-2xl mb-4 text-center">Actions for NFT #{tokenId}</h3>

        {renderListSection()}

        {renderTransferSection()}

        <button
          onClick={onOpenURI}
          className="w-full py-2 px-3 bg-red-600 rounded hover:bg-gray-500 text-gray-100 mb-2"
        >
          Open Metadata
        </button>
        {isForSale && onUnlist && (
          <button
            onClick={onUnlist}
            className="w-full py-2 px-3 mb-2 bg-orange-500 text-gray-100 rounded hover:bg-gray-500"
          >
            Remove from Sale
          </button>
        )}

        {isOwner && (
          <button
            onClick={async () => {
              if (!window.confirm(`Are you sure you want to delete NFT #${tokenId}?`)) return;
              try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contract = getContract(signer);
                const tx = await contract.burn(tokenId);
                await tx.wait();
                onClose();
                window.location.reload();
              } catch (err) {
                console.warn("Failed to delete NFT:", err);
                setDeleteError("Failed to delete NFT. Please try again.");
              }
            }}
            className="w-full py-2 px-3 bg-red-700 text-white rounded hover:bg-red-800 mt-2"
          >
            Delete NFT
          </button>
        )}

      </div>
    </div>
  );
}
