import { ethers } from "ethers";                     
import DarkDuckNFT from "../abi/DarkDuckNFT.json";   // ABI file from the solidity contract
import contractAddress from "../abi/contract-address.json"; // JSON file containing contract address

const CONTRACT_ADDRESS = contractAddress.DarkDuckNFT;   // Extracting contract address from JSON file - automatic after redeployment

export function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, DarkDuckNFT.abi, signerOrProvider);
}
