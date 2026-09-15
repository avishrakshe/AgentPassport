// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IAgentRegistry} from "./interfaces/IAgentRegistry.sol";
import {IReputationLedger} from "./interfaces/IReputationLedger.sol";

/**
 * @title ReputationLedger
 * @notice Stores interactions and computes time-decayed trust scores for registered agents.
 * @dev Implements 14-day half-life decay math with fixed-point arithmetic (1e18 scale).
 */
contract ReputationLedger is IReputationLedger {
    error ZeroAddress();
    error ScoreOutOfBounds(int8 score);
    error SelfRatingNotAllowed();
    error RaterNotRegistered(address rater);
    error RateeNotRegistered(address rated);
    error RatingCooldownActive(uint256 secondsRemaining);

    uint256 public constant SCALE = 1e18;
    uint256 public constant HALF_LIFE = 14 days;
    uint256 public constant COOLDOWN_PERIOD = 24 hours;

    IAgentRegistry public immutable agentRegistry;

    // rated agent => list of ratings
    mapping(address => Rating[]) private _ratings;

    // rater => rated => timestamp of last rating
    mapping(address => mapping(address => uint256)) public override lastRatingTimestamp;

    constructor(address _agentRegistry) {
        if (_agentRegistry == address(0)) {
            revert ZeroAddress();
        }
        agentRegistry = IAgentRegistry(_agentRegistry);
    }

    /**
     * @notice Submits a rating for an agent interaction.
     * @param rated The address of the agent being rated.
     * @param score Integer score between -5 and 5.
     * @param interactionHash Cryptographic hash identifying the interaction or job.
     */
    function submitRating(address rated, int8 score, bytes32 interactionHash) external override {
        if (score < -5 || score > 5) {
            revert ScoreOutOfBounds(score);
        }
        if (msg.sender == rated) {
            revert SelfRatingNotAllowed();
        }
        if (!agentRegistry.isRegistered(msg.sender)) {
            revert RaterNotRegistered(msg.sender);
        }
        if (!agentRegistry.isRegistered(rated)) {
            revert RateeNotRegistered(rated);
        }

        uint256 lastTime = lastRatingTimestamp[msg.sender][rated];
        if (lastTime != 0 && block.timestamp < lastTime + COOLDOWN_PERIOD) {
            revert RatingCooldownActive(lastTime + COOLDOWN_PERIOD - block.timestamp);
        }

        lastRatingTimestamp[msg.sender][rated] = block.timestamp;

        _ratings[rated].push(Rating({
            rater: msg.sender,
            rated: rated,
            score: score,
            interactionHash: interactionHash,
            timestamp: block.timestamp
        }));

        emit RatingSubmitted(msg.sender, rated, score);
    }

    /**
     * @notice Computes weight for a given rating timestamp based on 14-day half-life decay.
     * @dev weight = 1e18 / (1e18 + (daysSince * 1e18 / 14))
     *      = 1e36 / (1e18 + (timeSince * 1e18 / 14 days))
     * @param ratingTimestamp The timestamp when the rating was recorded.
     * @param currentTimestamp The timestamp at which decay is evaluated.
     * @return weight Scaled by 1e18 (1e18 = 1.0 at t=0, 0.5e18 at t=14 days).
     */
    function calculateWeight(uint256 ratingTimestamp, uint256 currentTimestamp) public pure returns (uint256) {
        if (currentTimestamp <= ratingTimestamp) {
            return SCALE;
        }
        uint256 timeSince = currentTimestamp - ratingTimestamp;
        // decayTerm = (timeSince * SCALE) / HALF_LIFE
        uint256 decayTerm = (timeSince * SCALE) / HALF_LIFE;
        uint256 denominator = SCALE + decayTerm;
        return (SCALE * SCALE) / denominator;
    }

    /**
     * @notice Computes the time-decayed weighted trust score for an agent.
     * @dev Returns fixed-point signed integer scaled by 1e18, in range [-5e18, +5e18].
     *      Returns 0 if the agent has no ratings.
     * @param agent The address of the agent.
     * @return trustScore Scaled by 1e18 (e.g. 5e18 = +5.00, -3.5e18 = -3.50).
     */
    function getTrustScore(address agent) public view override returns (int256) {
        Rating[] storage ratings = _ratings[agent];
        uint256 len = ratings.length;
        if (len == 0) {
            return 0;
        }

        int256 weightedScoreSum = 0;
        uint256 totalWeight = 0;

        for (uint256 i = 0; i < len; i++) {
            Rating storage r = ratings[i];
            uint256 weight = calculateWeight(r.timestamp, block.timestamp);
            totalWeight += weight;
            // casting to 'int256' is safe because weight <= 1e18
            // forge-lint: disable-next-line(unsafe-typecast)
            weightedScoreSum += int256(r.score) * int256(weight);
        }

        if (totalWeight == 0) {
            return 0;
        }

        // casting to 'int256' is safe because SCALE = 1e18 and totalWeight is bounded
        // forge-lint: disable-next-line(unsafe-typecast)
        return (weightedScoreSum * int256(SCALE)) / int256(totalWeight);
    }

    /**
     * @notice Returns trust score mapped to unsigned scale [0, 10e18] where 5e18 is neutral.
     * @param agent The address of the agent.
     */
    function getTrustScoreUint(address agent) external view override returns (uint256) {
        int256 score = getTrustScore(agent);
        // Map [-5e18, 5e18] to [0, 10e18]
        // forge-lint: disable-next-line(unsafe-typecast)
        int256 shifted = score + int256(5 * SCALE);
        if (shifted < 0) return 0;
        // forge-lint: disable-next-line(unsafe-typecast)
        return uint256(shifted);
    }

    /**
     * @notice Returns the total count of ratings received by an agent.
     * @param agent The agent address.
     */
    function getRatingCount(address agent) external view override returns (uint256) {
        return _ratings[agent].length;
    }

    /**
     * @notice Returns all ratings received by an agent.
     * @param agent The agent address.
     */
    function getRatings(address agent) external view override returns (Rating[] memory) {
        return _ratings[agent];
    }
}
