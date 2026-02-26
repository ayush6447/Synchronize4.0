// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TitleRegistry
 * @dev An immutable audit log for the PRGI Title Verification System.
 * Stores only a keccak256 hash of the title, the timestamp, and the submitter's address.
 * Access-controlled: only the contract owner (PRGI authority) may register titles.
 */
contract TitleRegistry {

    address public owner;

    struct TitleRecord {
        bytes32 titleHash;
        uint256 timestamp;
        address submitter;
    }

    // Mapping of title hashes to avoid duplicate registrations on-chain
    mapping(bytes32 => bool) public isRegistered;

    // Array to keep the historical log of all registrations
    TitleRecord[] public registryLog;

    event TitleVerified(bytes32 indexed titleHash, address indexed submitter, uint256 timestamp);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "TitleRegistry: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @dev Transfers ownership to a new address. Only callable by current owner.
     * @param newOwner The address of the new owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "TitleRegistry: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @dev Registers an approved title hash to the blockchain.
     * Only the contract owner (PRGI authority) may call this.
     * @param _titleHash The keccak256 hash of the verified title string.
     */
    function registerTitle(bytes32 _titleHash) public onlyOwner {
        require(_titleHash != bytes32(0), "TitleRegistry: title hash cannot be zero");
        require(!isRegistered[_titleHash], "Title is already registered on the blockchain.");

        isRegistered[_titleHash] = true;

        uint256 currentTime = block.timestamp;

        registryLog.push(TitleRecord({
            titleHash: _titleHash,
            timestamp: currentTime,
            submitter: msg.sender
        }));

        emit TitleVerified(_titleHash, msg.sender, currentTime);
    }

    /**
     * @dev Retrieves the total number of registered titles.
     */
    function getTotalTitles() public view returns (uint256) {
        return registryLog.length;
    }
}
