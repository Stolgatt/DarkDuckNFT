'use client';

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "@/utils/contract";
import Navbar from "@/components/Navbar";

export default function AdminPage() {
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [feeCollector, setFeeCollector] = useState<string>("");
  const [accumulatedFees, setAccumulatedFees] = useState<string>("0");

  const [newCollector, setNewCollector] = useState("");
  const [newFee, setNewFee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const user = await signer.getAddress();
    const contract = getContract(signer);

    const [owner, fee, collector, fees] = await Promise.all([
      contract.owner(),
      contract.getPlatformFee(),
      contract.feeCollector(),
      contract.getAccumulatedFees(),
    ]);

    setConnectedAccount(user);
    setOwnerAddress(owner);
    setIsOwner(user.toLowerCase() === owner.toLowerCase());
    setPlatformFee(Number(fee));
    setFeeCollector(collector);
    setAccumulatedFees(ethers.formatEther(fees));
  };

  useEffect(() => {
    loadData();
  }, []);

  async function handleChangeCollector() {
    if (!newCollector || !window.ethereum) return;
    if (!window.confirm(`Change fee collector to ${newCollector}?`)) return;

    try {
      setIsSubmitting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.setFeeCollector(newCollector);
      await tx.wait();
      alert("Fee collector updated.");
      await loadData();
      setNewCollector("");
    } catch (err) {
      console.error(err);
      alert("Failed to update fee collector.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangeFee() {
    const fee = Number(newFee);
    if (!newFee || isNaN(fee) || fee < 0 || fee > 1000 || !window.ethereum) {
      alert("Invalid fee. Max is 1000 basis points (10%).");
      return;
    }
    if (!window.confirm(`Change platform fee to ${fee} basis points?`)) return;

    try {
      setIsSubmitting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.setPlatformFee(fee);
      await tx.wait();
      alert("Platform fee updated.");
      await loadData();
      setNewFee("");
    } catch (err) {
      console.error(err);
      alert("Failed to update platform fee.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleWithdraw() {
    if (!window.ethereum) return;
    if (!window.confirm("Withdraw all collected platform fees?")) return;

    try {
      setIsSubmitting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.withdrawFunds();
      await tx.wait();
      alert("Fees withdrawn.");
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to withdraw fees.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOwner) {
    return (
      <>
        <Navbar />
        <main className="p-6">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p>This page is only accessible to the contract owner.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="p-6 max-w-2xl mx-auto">
        <h2 className="text-5xl font-extrabold tracking-tight text-gray-100 mb-4 text-center">Admin Dashboard</h2>

        <div className="bg-white rounded shadow p-6 mb-4">
          <p className="text-lg text-black mb-2">Connected as: {connectedAccount}</p>
          <p className="text-md text-black mb-2">Current platform fee: <strong>{platformFee / 100}%</strong></p>
          <p className="text-md text-black mb-2">Fee collector address: <strong>{feeCollector}</strong></p>
          <p className="text-md text-black mb-4">Accumulated fees: <strong>{accumulatedFees} ETH</strong></p>

          <div className="text-lg text-black mt-4">
            <input
              type="text"
              placeholder="New fee collector address"
              value={newCollector}
              onChange={(e) => setNewCollector(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2"
            />
            <button
              onClick={handleChangeCollector}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Change Fee Collector
            </button>
          </div>

          <div className="text-lg text-black mt-6">
            <input
              type="number"
              placeholder="New platform fee (max 1000)"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-2"
              min="0"
              max="1000"
            />
            <button
              onClick={handleChangeFee}
              disabled={isSubmitting}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              Change Platform Fee
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={handleWithdraw}
              disabled={isSubmitting}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              Withdraw Accumulated Fees
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
