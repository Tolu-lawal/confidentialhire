// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

contract BidVault {

    struct Bid {
        address freelancer;
        uint256 submittedAt;
        bool exists;
    }

    mapping(uint256 => Bid[]) private _bids;
    mapping(uint256 => mapping(address => uint256)) private _bidIndex;

    address public immutable jobRegistry;

    event BidSubmitted(uint256 indexed jobId, address indexed freelancer);

    constructor(address _jobRegistry) {
        jobRegistry = _jobRegistry;
    }

    function submitBid(
        uint256 jobId,
        bytes32 encryptedAmount,
        bytes calldata inputProof
    ) external {
        require(_bidIndex[jobId][msg.sender] == 0, "already bid");

        uint256 idx = _bids[jobId].length;
        _bids[jobId].push(Bid({
            freelancer: msg.sender,
            submittedAt: block.timestamp,
            exists: true
        }));
        _bidIndex[jobId][msg.sender] = idx + 1;

        emit BidSubmitted(jobId, msg.sender);
    }

    function getBidCount(uint256 jobId) external view returns (uint256) {
        return _bids[jobId].length;
    }

    function getBidders(uint256 jobId) external view returns (address[] memory bidders) {
        Bid[] storage bids = _bids[jobId];
        bidders = new address[](bids.length);
        for (uint256 i = 0; i < bids.length; i++) {
            bidders[i] = bids[i].freelancer;
        }
    }
}