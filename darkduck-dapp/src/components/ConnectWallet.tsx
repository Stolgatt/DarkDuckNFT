'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

type Props = {
  onConnected: (address: string) => void;
};

export default function ConnectWallet({ onConnected }: Props) {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    if (connecting) {
      setConnectionError("Connection already in progress. Please check MetaMask.");
      return;
    }

    try {
      setConnecting(true);
      setConnectionError(null);

      // ✅ Utilisation directe de l'API MetaMask pour éviter les erreurs internes d'ethers.js
      const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAccount(account);
      onConnected(account);

    } catch (error: any) {
      if (error?.code === -32002) {
        setConnectionError("A MetaMask connection request is already pending. Please open MetaMask.");
        // ❌ on NE log plus ici pour éviter la console polluée
      } else {
        console.error("Wallet connection failed", error);
        setConnectionError("Wallet connection failed. See console.");
      }
    } finally {
      setConnecting(false);
    }
  }

  useEffect(() => {
    async function checkExistingConnection() {
      if (!window.ethereum) return;
      try {
        const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onConnected(accounts[0]);
        }
      } catch (err) {
        console.error("Failed to check wallet connection", err);
      } finally {
        setCheckingConnection(false);
      }
    }

    checkExistingConnection();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onConnected(accounts[0]);
        } else {
          setAccount(null);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  if (checkingConnection) return null;

  return (
    <div className="mb-4">
      {account ? (
        <p className="text-sm text-gray-700">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </p>
      ) : (
        <>
          <button
            onClick={connectWallet}
            disabled={connecting}
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
              connecting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {connectionError && (
            <p className="text-sm text-red-600 mt-2">{connectionError}</p>
          )}
        </>
      )}
    </div>
  );
}
