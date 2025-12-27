const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    const contractFactory = await ethers.getContractFactory("DarkDuckNFT");
    const contract = await contractFactory.deploy(deployer.address);
    await contract.waitForDeployment();

    const contractAddress = await contract.target;
    console.log("DarkDuckNFT deployed to:", contractAddress);

    const frontendPath = path.join(__dirname, "../../darkduck-dapp/src/abi/contract-address.json");

    fs.writeFileSync(
        frontendPath,
        JSON.stringify({ DarkDuckNFT: contractAddress }, null, 2)
    );

    console.log(`Contract address saved to ${frontendPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});