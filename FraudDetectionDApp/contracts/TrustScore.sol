// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TrustScore {
    mapping(address => uint256) public userScores;
    
    uint256 public constant MAX_SCORE = 100;
    uint256 public constant MIN_SCORE = 0;
    uint256 public constant DEFAULT_SCORE = 50;
    
    address public admin;

    event ScoreUpdated(address user, uint256 newScore);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    // Initialize user score if they don't have one
    function initializeScore(address _user) internal {
        if(userScores[_user] == 0) {
            userScores[_user] = DEFAULT_SCORE;
        }
    }

    function getScore(address _user) public view returns (uint256) {
        return userScores[_user] == 0 ? DEFAULT_SCORE : userScores[_user];
    }

    function updateScore(address _user, int256 _change) public onlyAdmin {
        initializeScore(_user);
        
        int256 currentScore = int256(userScores[_user]);
        int256 newScoreInt = currentScore + _change;
        
        uint256 newScore;
        
        if(newScoreInt > int256(MAX_SCORE)) {
            newScore = MAX_SCORE;
        } else if(newScoreInt < int256(MIN_SCORE)) {
            newScore = MIN_SCORE;
        } else {
            newScore = uint256(newScoreInt);
        }
        
        userScores[_user] = newScore;
        emit ScoreUpdated(_user, newScore);
    }
}
