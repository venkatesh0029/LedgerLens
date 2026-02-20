// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TransactionRegistry {
    struct AppTransaction {
        uint256 id;
        address user;
        uint256 amount;
        string timestamp;
        bool isFraudulent;
        string predictionHash;
    }

    uint256 public transactionCount;
    mapping(uint256 => AppTransaction) public transactions;
    mapping(address => uint256[]) public userTransactions;

    event TransactionAdded(uint256 id, address user, uint256 amount, bool isFraudulent);

    function addTransaction(uint256 _amount, string memory _timestamp, bool _isFraudulent, string memory _predictionHash) public {
        transactionCount++;
        
        transactions[transactionCount] = AppTransaction(
            transactionCount,
            msg.sender,
            _amount,
            _timestamp,
            _isFraudulent,
            _predictionHash
        );

        userTransactions[msg.sender].push(transactionCount);

        emit TransactionAdded(transactionCount, msg.sender, _amount, _isFraudulent);
    }

    function getTransaction(uint256 _id) public view returns (AppTransaction memory) {
        return transactions[_id];
    }
    
    function getUserTransactions(address _user) public view returns (uint256[] memory) {
        return userTransactions[_user];
    }
}
