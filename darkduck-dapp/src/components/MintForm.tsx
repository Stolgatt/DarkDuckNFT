'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../utils/contract';

export default function MintForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageCID, setImageCID] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate CID format
  const isCIDValid = (cid: string) =>
    /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid) || /^baf[a-z0-9]{54,}$/.test(cid);
  


  useEffect(() => {
    async function getWallet() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) setWalletAddress(accounts[0]);
      }
    }
    getWallet();
  }, []);

  useEffect(() => {
    async function checkOwnership() {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = getContract(signer);
        const user = await signer.getAddress();
        const owner = await contract.owner();
        setIsOwner(user.toLowerCase() === owner.toLowerCase());
      } catch {
        setError('Failed to check contract owner.');
      }
    }
    checkOwnership();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageCID('');
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setPreviewUrl(null);
  };

  const handleMint = async () => {
    if (!name.trim() || !description.trim()) {
      setError("Name and description are required.");
      return;
    }

    if (!uploadedImage && !imageCID.trim()) {
      setError("You must upload an image or provide a CID.");
      return;
    }

    if (!uploadedImage && !isCIDValid(imageCID.trim())) {
      setError("Invalid CID format.");
      return;
    }

    try {
      setLoading(true);
      setError('');
      setStatus('Uploading image and metadata...');

      let finalCID = imageCID;

      if (uploadedImage) {
        const formData = new FormData();
        formData.append('file', uploadedImage);

        const res = await fetch('/api/pinata-upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Image upload failed");
        }

        const data = await res.json();
        finalCID = data.cid;
      }

      const metadata = {
        name,
        description,
        image: `ipfs://${finalCID}`,
      };

      const resMeta = await fetch('/api/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata),
      });

      if (!resMeta.ok) throw new Error("Metadata upload failed");
      const { metadataUrl } = await resMeta.json();

      setStatus('Minting NFT...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const tx = await contract.mintDDNFT(walletAddress, metadataUrl);
      await tx.wait();

      setStatus('NFT minted!');
      setName('');
      setDescription('');
      setImageCID('');
      setUploadedImage(null);
      setPreviewUrl(null);
    } catch (err: any) {
      const message = err?.error?.message || err?.message || 'Unknown error';
      const code = err?.code || err?.error?.code;
    
      if (code === 4001 || message.includes("User denied transaction")) {
        setError("Transaction cancelled by user.");
      } else {
        console.error("Mint error:", err);
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-8 mt-6">
      {/* Form */}
      <div className="w-1/2 border p-4 rounded">
        <h2 className="text-lg font-semibold mb-4">Mint your DarkDuck NFT</h2>

        <input
          className="w-full border px-2 py-1 mb-2"
          type="text"
          maxLength={100}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full border px-2 py-1 mb-1"
          maxLength={255}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-sm text-gray-400 text-right mb-2">
          {description.length} / 255
        </p>


        {/* Upload */}
        <label className="block mb-1 font-semibold">Upload image:</label>
        <div className="flex items-center gap-2 mb-2">
          <label className="bg-blue-600 text-white px-3 py-1 rounded cursor-pointer hover:bg-blue-700">
            Select image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          {uploadedImage && (
            <button
              className="text-sm text-red-500 underline"
              onClick={removeImage}
            >
              Remove image
            </button>
          )}
        </div>

        {/* CID */}
        <label className="block mt-2 font-semibold">Or enter IPFS CID:</label>
        <input
          className="w-full border px-2 py-1 mb-2"
          type="text"
          placeholder="CID (e.g. Qm... or bafy...)"
          value={imageCID}
          onChange={(e) => setImageCID(e.target.value)}
          disabled={!!uploadedImage}
        />

        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          onClick={handleMint}
          disabled={!isOwner || loading}
        >
          {loading ? 'Minting...' : 'Mint NFT'}
        </button>

        {isOwner === false && (
          <p className="text-red-500 text-sm mb-2">
            Only the contract owner can mint NFTs. Please connect with the deployer account.
          </p>
        )}
        
        {status && <p className="text-green-500 mt-2">{status}</p>}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        
        {!uploadedImage && imageCID && !isCIDValid(imageCID) && (
          <p className="text-sm text-red-400 mb-2">CID format is not valid.</p>
        )}
      </div>

      {/* Preview */}
      <div className="relative rounded p-4 w-70 shadow-sm">
        <h3 className="text-md font-semibold mb-2">Preview</h3>
        <div className="relative border rounded p-4 w-60 shadow-sm bg-white">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="rounded border mb-2"
            />
          ) : imageCID ? (
            <img
              src={`https://ipfs.io/ipfs/${imageCID}`}
              alt="Loading from IPFS..."
              className="rounded border mb-2"
              onLoad={() => setStatus('')} // reset status after load
              onError={() => setStatus('Image load error')}
            />
          ) : (
            <div className="h-48 bg-gray-100 text-center flex items-center justify-center text-gray-400 border rounded mb-2">
              No image selected
            </div>
          )}

          <p className="text-xl font-bold text-black break-words">
            {name || 'Name'}
          </p>
          <p className="text-sm text-gray-600 mb-2 break-words">
            {description || 'Description...'}
          </p>
        </div>
      </div>
    </div>
  );
}
