// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, euint64, euint32, ebool, externalEuint8, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ReputationLedger is ZamaEthereumConfig {

    struct FreelancerRecord {
        euint64 totalEarnings;
        euint32 ratingSum;
        uint32  ratingCount;
        uint256 completedJobs;
        bool    exists;
    }

    mapping(address => FreelancerRecord) private _records;
    address public immutable jobRegistry;

    event RatingSubmitted(address indexed freelancer, uint256 completedJobs);
    event EarningsUpdated(address indexed freelancer, uint256 completedJobs);

    constructor(address _jobRegistry) {
        jobRegistry = _jobRegistry;
    }

    function _ensureRecord(address freelancer) internal {
        if (!_records[freelancer].exists) {
            euint64 zeroEarnings = FHE.asEuint64(0);
            euint32 zeroRating   = FHE.asEuint32(0);
            FHE.allowThis(zeroEarnings);
            FHE.allowThis(zeroRating);
            FHE.allow(zeroEarnings, freelancer);
            FHE.allow(zeroRating, freelancer);
            _records[freelancer] = FreelancerRecord({
                totalEarnings: zeroEarnings,
                ratingSum:     zeroRating,
                ratingCount:   0,
                completedJobs: 0,
                exists:        true
            });
        }
    }

    function submitRating(
        address freelancer,
        externalEuint8 encryptedRating,
        bytes calldata inputProof
    ) external {
        require(msg.sender == jobRegistry, "ReputationLedger: only JobRegistry");
        _ensureRecord(freelancer);
        euint8 rating = FHE.fromExternal(encryptedRating, inputProof);
        FHE.allowThis(rating);
        FHE.allow(rating, freelancer);
        FreelancerRecord storage rec = _records[freelancer];
        euint32 ratingAs32 = FHE.asEuint32(rating);
        FHE.allowThis(ratingAs32);
        rec.ratingSum = FHE.add(rec.ratingSum, ratingAs32);
        FHE.allowThis(rec.ratingSum);
        FHE.allow(rec.ratingSum, freelancer);
        rec.ratingCount++;
        rec.completedJobs++;
        emit RatingSubmitted(freelancer, rec.completedJobs);
    }

    function recordEarnings(
        address freelancer,
        externalEuint64 encryptedEarning,
        bytes calldata inputProof
    ) external {
        require(msg.sender == jobRegistry, "ReputationLedger: only JobRegistry");
        _ensureRecord(freelancer);
        euint64 earning = FHE.fromExternal(encryptedEarning, inputProof);
        FHE.allowThis(earning);
        FHE.allow(earning, freelancer);
        FreelancerRecord storage rec = _records[freelancer];
        rec.totalEarnings = FHE.add(rec.totalEarnings, earning);
        FHE.allowThis(rec.totalEarnings);
        FHE.allow(rec.totalEarnings, freelancer);
        emit EarningsUpdated(freelancer, rec.completedJobs);
    }

    function proveRatingAbove(address freelancer, uint32 threshold)
        external
        returns (ebool result)
    {
        require(_records[freelancer].exists, "ReputationLedger: freelancer not found");
        FreelancerRecord storage rec = _records[freelancer];
        require(rec.ratingCount > 0, "ReputationLedger: no ratings yet");
        euint32 scaledThreshold = FHE.asEuint32(threshold * rec.ratingCount);
        FHE.allowThis(scaledThreshold);
        result = FHE.ge(rec.ratingSum, scaledThreshold);
        FHE.allowThis(result);
        FHE.allow(result, freelancer);
    }

    function proveEarningsAbove(address freelancer, uint64 thresholdInWei)
        external
        returns (ebool result)
    {
        require(_records[freelancer].exists, "ReputationLedger: freelancer not found");
        euint64 threshold = FHE.asEuint64(thresholdInWei);
        FHE.allowThis(threshold);
        result = FHE.ge(_records[freelancer].totalEarnings, threshold);
        FHE.allowThis(result);
        FHE.allow(result, freelancer);
    }

    function getEncryptedEarnings(address freelancer)
        external
        view
        returns (euint64)
    {
        require(_records[freelancer].exists, "ReputationLedger: not found");
        return _records[freelancer].totalEarnings;
    }

    function getEncryptedRatingSum(address freelancer)
        external
        view
        returns (euint32)
    {
        require(_records[freelancer].exists, "ReputationLedger: not found");
        return _records[freelancer].ratingSum;
    }

    function getPublicStats(address freelancer)
        external
        view
        returns (uint32 ratingCount, uint256 completedJobs)
    {
        FreelancerRecord storage rec = _records[freelancer];
        return (rec.ratingCount, rec.completedJobs);
    }
}