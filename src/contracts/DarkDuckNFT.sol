/// @title DarkDuckNFT Contract
/// @author Alexis CHAVY
/// @notice This contract implements an ERC-721 NFT collection representing debugging ducks.
/// @dev Includes custom marketplace logic for minting, listing, and purchasing NFTs, as well as fee collection.



// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// for debugging
import "hardhat/console.sol";

contract DarkDuckNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    uint256 public platformFee = 1000; // 10% on a 10 000 basis point scale
    address public feeCollector;
    uint256 public accumulatedFees;

    struct SaleInfo {
        bool isForSale;
        uint256 price;
    }

    mapping(uint256 => SaleInfo) public listings;

    event FundsWithdrawn(address indexed collector, uint256 amount);

    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);


    /// @notice Initializes the NFT contract with a fee collector address
    /// @param _feeCollector The address that will receive accumulated fees
    constructor(address _feeCollector) ERC721("DarkDuckNFT", "DDNFT") Ownable(msg.sender) {
        feeCollector = _feeCollector;
    }

    /// @notice Mints a new NFT with a given metadata URI and assigns it to the specified owner
    /// @dev Only the contract owner can call this function
    /// @param owner The address that will receive the minted NFT
    /// @param tokenURI The URI pointing to the metadata of the NFT (cannot be empty)
    /// @return The ID of the newly minted token
    function mintDDNFT(address owner, string memory tokenURI) public onlyOwner returns (uint256) {
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        emit NFTMinted(owner, tokenId, tokenURI);

        return tokenId;
    }


    /// @notice Checks if a user is the owner of a given NFT
    /// @param tokenId The ID of the NFT
    /// @param user The address to check ownership against
    /// @return True if the user owns the NFT, false otherwise
    function isOwnerOfNFT(uint256 tokenId, address user) public view returns (bool) {
        return ownerOf(tokenId) == user;
    }

    /// @notice Lists an NFT for sale at a specified price
    /// @dev The caller must be the owner of the NFT
    /// @param tokenId The ID of the NFT to list
    /// @param price The price (in wei) at which the NFT will be listed
    function listForSale(uint256 tokenId, uint256 price) public {
        require(isOwnerOfNFT(tokenId, msg.sender), "Not the owner");
        approve(address(this), tokenId);
        listings[tokenId] = SaleInfo(true, price);
    }

    /// @notice Removes an NFT from the sale listing
    /// @dev The caller must be the owner of the NFT
    /// @param tokenId The ID of the NFT to unlist
    function unlistFromSale(uint256 tokenId) public {
        require(isOwnerOfNFT(tokenId, msg.sender), "Not the owner");
        listings[tokenId].isForSale = false;
    }

    /// @notice Updates the sale price of an NFT
    /// @dev The caller must be the owner of the NFT
    /// @param tokenId The ID of the NFT to update
    /// @param newPrice The new price (in wei) for the NFT
    function updateSalePrice(uint256 tokenId, uint256 newPrice) public {
        require(isOwnerOfNFT(tokenId, msg.sender), "Not the owner");
        require(listings[tokenId].isForSale, "NFT not for sale");
        listings[tokenId].price = newPrice;
    }

    /// @notice Purchases an NFT that has been listed for sale
    /// @dev Transfers ownership and handles platform fees
    /// @param tokenId The ID of the NFT to purchase
    function buyDDNFT(uint256 tokenId) public payable {
        SaleInfo memory sale = listings[tokenId];
        require(sale.isForSale, "NFT not for sale");
        uint256 totalPrice = sale.price + (sale.price * platformFee / 10000);
        require(msg.value >= totalPrice, "Insufficient funds");

        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId);

        uint256 fee = totalPrice - sale.price;
        accumulatedFees += fee;
        payable(seller).transfer(sale.price);

        listings[tokenId].isForSale = false;
    }

    /// @notice Transfers an NFT to another address
    /// @dev The caller must be the current owner
    /// @param to The recipient address
    /// @param tokenId The ID of the NFT to transfer
    function transferNFT(address to, uint256 tokenId) public {
        require(isOwnerOfNFT(tokenId, msg.sender), "Not the owner");
        _transfer(msg.sender, to, tokenId);
    }

    /// @notice Updates the platform fee percentage
    /// @dev Only callable by the contract owner. Max 10% (1000 basis points)
    /// @param newFee The new platform fee in basis points
    function setPlatformFee(uint256 newFee) public onlyOwner {
        require(newFee <= 1000, "Fee exceeds maximum allowed");
        platformFee = newFee;
    }

    /// @notice Returns the current platform fee percentage
    /// @return The current platform fee in basis points
    function getPlatformFee() public view returns (uint256) {
        return platformFee;
    }
    
    /// @notice Sets a new address to collect platform fees
    /// @dev Only callable by the contract owner
    /// @param newCollector The new fee collector address
    function setFeeCollector(address newCollector) public onlyOwner {
        require(newCollector != address(0), "Invalid address");
        feeCollector = newCollector;
    }

    /// @notice Withdraws accumulated platform fees to the fee collector
    /// @dev Only callable by the contract owner
    function withdrawFunds() public onlyOwner {
        uint256 amount = accumulatedFees;
        accumulatedFees = 0;
        payable(feeCollector).transfer(amount);
        emit FundsWithdrawn(feeCollector, amount);
    }

    /// @notice Returns the accumulated fees
    /// @return The total accumulated fees
    function getAccumulatedFees() public view returns (uint256) {
        return accumulatedFees;
    }

    /// @notice Returns the ID of the last minted token
    function getLastTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }

    /// @notice Burns an NFT, removing it from circulation
    /// @param tokenId The ID of the NFT to burn
    function burn(uint256 tokenId) public onlyOwner{
        require(ownerOf(tokenId) == msg.sender, "Not authorized to burn");
        _burn(tokenId);
    }

}
