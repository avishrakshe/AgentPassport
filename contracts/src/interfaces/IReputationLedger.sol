// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReputationLedger {
    struct Rating {
        address rater;
        address rated;
        int8 score;
        bytes32 interactionHash;
        uint256 timestamp;
    }

    event RatingSubmitted(address indexed rater, address indexed rated, int8 score);

    function submitRating(address rated, int8 score, bytes32 interactionHash) external;
    function getTrustScore(address agent) external view returns (int256);
    function getTrustScoreUint(address agent) external view returns (uint256);
    function getRatingCount(address agent) external view returns (uint256);
    function getRatings(address agent) external view returns (Rating[] memory);
    function lastRatingTimestamp(address rater, address rated) external view returns (uint256);
}
