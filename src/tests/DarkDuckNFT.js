// DarkDuckNFT test suite

// Import expect from chai for assertions
const { expect } = require("chai");

// Import ethers from hardhat for contract interaction
const { ethers } = require("hardhat");

// Import loadFixture from hardhat-toolbox to optimize test setup
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("DarkDuckNFT contract", function () {
    // Fixture to deploy the contract and get test accounts
    async function deployDarkDuckNFTFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy with owner as feeCollector
        const darkDuckNFT = await ethers.deployContract("DarkDuckNFT", [owner.address]);
        await darkDuckNFT.waitForDeployment();

        return { darkDuckNFT, owner, addr1, addr2 };
    }

    // Deployment tests
    describe("Deployment", function () {
        it("Should set the correct owner", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);
            expect(await darkDuckNFT.owner()).to.equal(owner.address);
        });

        it("Should set the correct fee collector", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);
            expect(await darkDuckNFT.feeCollector()).to.equal(owner.address);
        });

        it("Should start with zero NFTs", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);
            const balance = await darkDuckNFT.balanceOf(owner.address);
            expect(balance).to.equal(0);
        });
    });

    // Minting tests
    describe("Minting", function () {

        it("Should allow the owner to mint a new NFT", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);

            const tokenURI = "https://myplaceholder.com/duck/1";
            const tx = await darkDuckNFT.mintDDNFT(owner.address, tokenURI);
            await tx.wait(); // Wait for confirmation

            expect(await darkDuckNFT.ownerOf(1)).to.equal(owner.address);
            expect(await darkDuckNFT.tokenURI(1)).to.equal(tokenURI);
        });

        it("Should not allow a non-owner to mint an NFT", async function () {
            const { darkDuckNFT, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            // Expect an OwnableUnauthorizedAccount custom error from Ownable when addr1 tries to mint
            await expect(
                darkDuckNFT.connect(addr1).mintDDNFT(addr1.address, "https://myplaceholder.com/duck/1")
            ).to.be.revertedWithCustomError(darkDuckNFT, "OwnableUnauthorizedAccount").withArgs(addr1.address);
            
        });

        it("Should increment tokenId for each new NFT", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");
            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/2");

            expect(await darkDuckNFT.ownerOf(2)).to.equal(owner.address);
        });

        it("Shoudl allow the owner to mint a NFT and assign it to a specific address", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            const tokenURI = "https://myplaceholder.com/duck/1";
            const tx = await darkDuckNFT.mintDDNFT(addr1.address, tokenURI);
            await tx.wait(); // Wait for confirmation

            expect(await darkDuckNFT.ownerOf(1)).to.equal(addr1.address);
            expect(await darkDuckNFT.tokenURI(1)).to.equal(tokenURI);
        });

        it("Should not allow minting with an empty tokenURI", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);

            await expect(
                darkDuckNFT.mintDDNFT(owner.address, "")
            ).to.be.revertedWith("Token URI cannot be empty");
        });

        it("Should emit NFTMinted event when a new NFT is minted", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);
            
            const tokenURI = "https://myplaceholder.com/duck/1";
        
            await expect(
                darkDuckNFT.mintDDNFT(owner.address, tokenURI)
            )
                .to.emit(darkDuckNFT, "NFTMinted")
                .withArgs(owner.address, 1, tokenURI);
        });        
    });

    // Listing tests
    describe("Listing NFTs for sale", function () {

        it("Should allow the NFT owner to list it for sale", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            const tokenId = 1;
            const price = ethers.parseEther("1.0");

            await darkDuckNFT.listForSale(tokenId, price);

            const listing = await darkDuckNFT.listings(tokenId);
            expect(listing.isForSale).to.be.true;
        });

        it("Should not allow a non-owner to list the NFT", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            const tokenId = 1;
            const price = ethers.parseEther("1.0");

            await expect(
                darkDuckNFT.connect(addr1).listForSale(tokenId, price)
            ).to.be.revertedWith("Not the owner");
        });

        it("Should approve the contract to transfer the NFT when listed", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");
            const tokenId = 1;
            const price = ethers.parseEther("1.0");

            await darkDuckNFT.listForSale(tokenId, price);

            // Check if the contract is approved to transfer the token
            const approved = await darkDuckNFT.getApproved(tokenId);
            expect(approved).to.equal(darkDuckNFT.target);
        });

        it("Should store the seller's price (without fee)", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            const tokenId = 1;
            const price = ethers.parseEther("1.0");

            await darkDuckNFT.listForSale(tokenId, price);

            const listing = await darkDuckNFT.listings(tokenId);

            // The stored price should be exactly what the seller sets
            expect(listing.price).to.equal(price);
        });

        it("Should allow a new owner to list their NFT for sale", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            const tokenId = 1;
            const price = ethers.parseEther("1.0");

            // Transfer NFT from owner to addr1
            await darkDuckNFT.transferFrom(owner.address, addr1.address, tokenId);

            // addr1 lists the NFT for sale
            await darkDuckNFT.connect(addr1).listForSale(tokenId, price);

            const listing = await darkDuckNFT.listings(tokenId);
            expect(listing.isForSale).to.be.true;
            expect(listing.price).to.equal(price);
        });

        it("Should allow the owner of a listed NFT to unlist it", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            const tokenId = 1;
            const price = ethers.parseEther("1.0");

            await darkDuckNFT.listForSale(tokenId, price);
            await darkDuckNFT.unlistFromSale(tokenId);

            const listing = await darkDuckNFT.listings(tokenId);
            expect(listing.isForSale).to.be.false;
        });

        it("Should not allow a non-owner to unlist the NFT", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            const tokenId = 1;
            const price = ethers.parseEther("1.0");

            await darkDuckNFT.listForSale(tokenId, price);
            await expect(
                darkDuckNFT.connect(addr1).unlistFromSale(tokenId)
            ).to.be.revertedWith("Not the owner");
        });

        it("Sould alow the owner to update the price of a listed NFT", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            const tokenId = 1;
            const price = ethers.parseEther("1.0");
            const newPrice = ethers.parseEther("2.0");

            await darkDuckNFT.listForSale(tokenId, price);
            await darkDuckNFT.updateSalePrice(tokenId, newPrice);

            const listing = await darkDuckNFT.listings(tokenId);
            expect(listing.price).to.equal(newPrice);
        });
        
        it("Should not allow a non-owner to update the price of a listed NFT", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            const tokenId = 1;
            const price = ethers.parseEther("1.0");
            const newPrice = ethers.parseEther("2.0");

            await darkDuckNFT.listForSale(tokenId, price);
            await expect(
                darkDuckNFT.connect(addr1).updateSalePrice(tokenId, newPrice)
            ).to.be.revertedWith("Not the owner");
        });

        it("Soudl not allow a user to udpate the price of an unlisted NFT", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            const tokenId = 1;
            const newPrice = ethers.parseEther("2.0");

            await expect(
                darkDuckNFT.updateSalePrice(tokenId, newPrice)
            ).to.be.revertedWith("NFT not for sale");
        });
    });

    // Buying tests
    describe("Buying NFTs", function () {

        it("Should allow a user to buy a listed NFT and transfer ownership and the NFT should not stay for sale", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            // Mint + list NFT
            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");
            const tokenId = 1;
            const price = ethers.parseEther("1.0");
            await darkDuckNFT.listForSale(tokenId, price);

            // Compute total price with 10% fee
            const fee = (price * 1000n) / 10000n;
            const totalPrice = price + fee;

            // Buy the NFT
            await expect(
                darkDuckNFT.connect(addr1).buyDDNFT(tokenId, { value: totalPrice })
            ).to.not.be.reverted;

            // New owner
            expect(await darkDuckNFT.ownerOf(tokenId)).to.equal(addr1.address);

            // Listing removed
            const listing = await darkDuckNFT.listings(tokenId);
            expect(listing.isForSale).to.be.false;
        });

        it("Should not allow a user to buy an unlisted NFT", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            const tokenId = 1;
            const price = ethers.parseEther("1.0");
            const fee = (price * 1000n) / 10000n;
            const totalPrice = price + fee;

            await expect(
                darkDuckNFT.connect(addr1).buyDDNFT(tokenId, { value: totalPrice })
            ).to.be.revertedWith("NFT not for sale");
        });

        it("Should not allow a user to buy with insufficient funds (fee included)", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            const tokenId = 1;
            const price = ethers.parseEther("1.0");

            await darkDuckNFT.listForSale(tokenId, price);

            // Not enough: missing fee
            await expect(
                darkDuckNFT.connect(addr1).buyDDNFT(tokenId, { value: price })
            ).to.be.revertedWith("Insufficient funds");
        });

        it("Should transfer the NFT to the buyer and the funds to the seller", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            const tokenId = 1;
            const price = ethers.parseEther("1.0");
            const fee = (price * 1000n) / 10000n;
            const totalPrice = price + fee;

            await darkDuckNFT.listForSale(tokenId, price);

            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

            // Buy NFT
            const tx = await darkDuckNFT.connect(addr1).buyDDNFT(tokenId, { value: totalPrice });
            const receipt = await tx.wait();

            // Seller should receive exactly the price (not the fee)
            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

            const received = ownerBalanceAfter - ownerBalanceBefore;

            // Slight margin for gas fluctuation
            expect(received).to.be.closeTo(price, ethers.parseEther("0.001"));

            // Platform should have accumulated the fee
            const accumulated = await darkDuckNFT.accumulatedFees();
            expect(accumulated).to.equal(fee);
        });

        it("Should accumulate fees in the contract", async function () {
            const { darkDuckNFT, owner, addr1, addr2 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");
            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/2");

            const price = ethers.parseEther("1.0");
            const fee = (price * 1000n) / 10000n;
            const totalPrice = price + fee;

            await darkDuckNFT.listForSale(1, price);
            await darkDuckNFT.listForSale(2, price);

            await darkDuckNFT.connect(addr1).buyDDNFT(1, { value: totalPrice });
            await darkDuckNFT.connect(addr2).buyDDNFT(2, { value: totalPrice });

            const accumulated = await darkDuckNFT.accumulatedFees();
            expect(accumulated).to.equal(fee * 2n);
        });
    });

    // Transfer tests
    describe("Transferring NFTs manually", function () {
        it("Should allow the owner to transfer an NFT to another address", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            await darkDuckNFT.transferNFT(addr1.address, 1);

            expect(await darkDuckNFT.ownerOf(1)).to.equal(addr1.address);
        });

        it("Should not allow a non-owner to transfer an NFT", async function () {
            const { darkDuckNFT, owner, addr1, addr2 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");

            await expect(
                darkDuckNFT.connect(addr1).transferNFT(addr2.address, 1)
            ).to.be.revertedWith("Not the owner");
        });
    });

    // Withdraw fees tests
    describe("Platform fees withdrawal", function () {
        it("Should allow the owner to withdraw accumulated fees", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            // Mint, list, sell
            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");
            const price = ethers.parseEther("1.0");
            const fee = (price * 1000n) / 10000n;
            const total = price + fee;

            await darkDuckNFT.listForSale(1, price);
            await darkDuckNFT.connect(addr1).buyDDNFT(1, { value: total });

            await expect(() => darkDuckNFT.withdrawFunds()).to.changeEtherBalance(owner, fee);
        });

        it("Sould transfer the fee to the fee collector and not to the owner", async function () {
            const { darkDuckNFT, owner, addr1, addr2} = await loadFixture(deployDarkDuckNFTFixture);

            // Mint, list, sell
            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");
            const price = ethers.parseEther("1.0");
            const fee = (price * 1000n) / 10000n;
            const total = price + fee;

            await darkDuckNFT.listForSale(1, price);
            await darkDuckNFT.connect(addr1).buyDDNFT(1, { value: total });

            // Change fee collector to addr2
            await darkDuckNFT.setFeeCollector(addr2.address);
            
            // Test that withdrawal sends fees to the fee collector (addr2) and not to the owner
            await expect(darkDuckNFT.withdrawFunds())
                .to.changeEtherBalances(
                    [owner, addr2],
                    [0, fee]
                );

            // Verify accumulated fees are now zero
            expect(await darkDuckNFT.accumulatedFees()).to.equal(0);

            // No fees left to withdraw, so a second withdrawal shouldn't change balances
            await expect(darkDuckNFT.withdrawFunds())
                .to.changeEtherBalances(
                    [owner, addr2],
                    [0, 0]
                );
        });

        it("Should reset accumulatedFees after withdrawal", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");
            const price = ethers.parseEther("1.0");
            const fee = (price * 1000n) / 10000n;
            const total = price + fee;

            await darkDuckNFT.listForSale(1, price);
            await darkDuckNFT.connect(addr1).buyDDNFT(1, { value: total });

            await darkDuckNFT.withdrawFunds();
            expect(await darkDuckNFT.accumulatedFees()).to.equal(0);
        });
    });

    // Admin settings
    describe("Admin settings", function () {
        it("Should allow the owner to change the platform fee", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.setPlatformFee(500);
            expect(await darkDuckNFT.platformFee()).to.equal(500);
        });

        it("Should not allow setting a fee higher than 10%", async function () {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);

            await expect(darkDuckNFT.setPlatformFee(1001)).to.be.revertedWith("Fee exceeds maximum allowed");
        });

        it("Should allow the owner to change the fee collector", async function () {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.setFeeCollector(addr1.address);
            expect(await darkDuckNFT.feeCollector()).to.equal(addr1.address);
        });

        it("Should not allow setting fee collector to zero address", async function () {
            const { darkDuckNFT } = await loadFixture(deployDarkDuckNFTFixture);

            await expect(
                darkDuckNFT.setFeeCollector(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid address");
        });

        it("Should allow the contract owner to burn a NFT", async function() {
            const { darkDuckNFT, owner } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");
            const tokenId = 1;
            await darkDuckNFT.burn(tokenId);
            await expect(darkDuckNFT.ownerOf(tokenId)).to.be.revertedWithCustomError(darkDuckNFT, "ERC721NonexistentToken");
        });

        it("Should not allow a non-owner to burn a NFT", async function() {
            const { darkDuckNFT, owner, addr1 } = await loadFixture(deployDarkDuckNFTFixture);

            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");
            const tokenId = 1;
            await expect(
                darkDuckNFT.connect(addr1).burn(tokenId)
            ).to.be.revertedWithCustomError(darkDuckNFT, "OwnableUnauthorizedAccount").withArgs(addr1.address);
    });

    // Integration test
    describe("Full NFT lifecycle", function () {
        it("Should correctly handle mint → list → buy → transfer → relist → fee update → rebuy → withdraw", async function () {
            const { darkDuckNFT, owner, addr1, addr2 } = await loadFixture(deployDarkDuckNFTFixture);

            const price = ethers.parseEther("1.0");
            const fee10 = (price * 1000n) / 10000n; // 10%
            const totalPrice10 = price + fee10;

            // Step 1: Owner mints the NFT
            await darkDuckNFT.mintDDNFT(owner.address, "https://myplaceholder.com/duck/1");
            const tokenId = 1;
            expect(await darkDuckNFT.ownerOf(tokenId)).to.equal(owner.address);

            // Step 2: Owner lists it for sale
            await darkDuckNFT.listForSale(tokenId, price);
            expect((await darkDuckNFT.listings(tokenId)).isForSale).to.be.true;

            // Step 3: addr1 buys it (10% fee)
            await darkDuckNFT.connect(addr1).buyDDNFT(tokenId, { value: totalPrice10 });
            expect(await darkDuckNFT.ownerOf(tokenId)).to.equal(addr1.address);

            // Step 4: addr1 transfers it to addr2
            await darkDuckNFT.connect(addr1).transferNFT(addr2.address, tokenId);
            expect(await darkDuckNFT.ownerOf(tokenId)).to.equal(addr2.address);

            // Step 5: addr2 lists it for sale
            await darkDuckNFT.connect(addr2).listForSale(tokenId, price);
            expect((await darkDuckNFT.listings(tokenId)).isForSale).to.be.true;

            // Step 6: Owner updates the platform fee to 5%
            await darkDuckNFT.setPlatformFee(500); // 5%
            expect(await darkDuckNFT.platformFee()).to.equal(500);

            const fee5 = (price * 500n) / 10000n; // 5%
            const totalPrice5 = price + fee5;

            // Step 7: Owner buys it back (5% fee this time)
            await darkDuckNFT.connect(owner).buyDDNFT(tokenId, { value: totalPrice5 });
            expect(await darkDuckNFT.ownerOf(tokenId)).to.equal(owner.address);
            expect((await darkDuckNFT.listings(tokenId)).isForSale).to.be.false;

            // Step 8: Withdraw fees
            const accumulated = await darkDuckNFT.accumulatedFees();
            const totalFees = fee10 + fee5;
            expect(accumulated).to.equal(totalFees);

            await expect(() => darkDuckNFT.withdrawFunds()).to.changeEtherBalance(owner, totalFees);

            // Final check: accumulatedFees is reset
            expect(await darkDuckNFT.accumulatedFees()).to.equal(0);
        });
    });
});
});

