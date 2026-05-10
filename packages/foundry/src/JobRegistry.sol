// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

contract JobRegistry {
    enum JobStatus { Open, Closed, Completed }

    struct Job {
        address client;
        string title;
        string description;
        uint256 deadline;
        JobStatus status;
        address winner;
        uint256 postedAt;
    }

    uint256 public jobCount;
    mapping(uint256 => Job) private _jobs;
    mapping(uint256 => uint256) public escrow;
    mapping(uint256 => bytes32) private _encryptedBudgets;

    event JobPosted(uint256 indexed jobId, address indexed client, string title, uint256 deadline);
    event WinnerSelected(uint256 indexed jobId, address indexed winner);
    event EscrowReleased(uint256 indexed jobId, address indexed recipient, uint256 amount);

    modifier onlyClient(uint256 jobId) {
        require(msg.sender == _jobs[jobId].client, "not the client");
        _;
    }

    modifier jobExists(uint256 jobId) {
        require(jobId < jobCount, "job does not exist");
        _;
    }

    function postJob(
        string calldata title,
        string calldata description,
        bytes32 encryptedBudget,
        bytes calldata inputProof,
        uint256 deadline
    ) external payable returns (uint256 jobId) {
        require(deadline > block.timestamp, "deadline must be in the future");
        require(msg.value > 0, "must deposit escrow");

        jobId = jobCount++;
        _jobs[jobId] = Job({
            client: msg.sender,
            title: title,
            description: description,
            deadline: deadline,
            status: JobStatus.Open,
            winner: address(0),
            postedAt: block.timestamp
        });
        _encryptedBudgets[jobId] = encryptedBudget;
        escrow[jobId] = msg.value;

        emit JobPosted(jobId, msg.sender, title, deadline);
    }

    function getEncryptedBudget(uint256 jobId) external view jobExists(jobId) returns (bytes32) {
        return _encryptedBudgets[jobId];
    }

    function selectWinner(uint256 jobId, address winner)
        external jobExists(jobId) onlyClient(jobId)
    {
        _jobs[jobId].winner = winner;
        _jobs[jobId].status = JobStatus.Completed;
        emit WinnerSelected(jobId, winner);
    }

    function releaseEscrow(uint256 jobId)
        external jobExists(jobId) onlyClient(jobId)
    {
        require(_jobs[jobId].winner != address(0), "no winner");
        uint256 payout = escrow[jobId] * 95 / 100;
        escrow[jobId] = 0;
        (bool ok,) = _jobs[jobId].winner.call{ value: payout }("");
        require(ok, "transfer failed");
        emit EscrowReleased(jobId, _jobs[jobId].winner, payout);
    }

    function getJob(uint256 jobId) external view jobExists(jobId) returns (
        address client, string memory title, string memory description,
        uint256 deadline, JobStatus status, address winner
    ) {
        Job storage job = _jobs[jobId];
        return (job.client, job.title, job.description, job.deadline, job.status, job.winner);
    }
}