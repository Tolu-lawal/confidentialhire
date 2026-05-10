// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {BidVault} from "../src/BidVault.sol";
import {ReputationLedger} from "../src/ReputationLedger.sol";
import {JobRegistry} from "../src/JobRegistry.sol";

contract DeployConfidentialHire is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy BidVault with placeholder
        BidVault bidVault = new BidVault(address(0));
        console.log("BidVault deployed at:", address(bidVault));

        // 2. Deploy ReputationLedger with placeholder
        ReputationLedger repLedger = new ReputationLedger(address(0));
        console.log("ReputationLedger deployed at:", address(repLedger));

        // 3. Deploy JobRegistry with real addresses
        JobRegistry jobRegistry = new JobRegistry();
        console.log("JobRegistry deployed at:", address(jobRegistry));

        console.log("--- SAVE THESE ADDRESSES ---");
        console.log("JOB_REGISTRY:", address(jobRegistry));
        console.log("BID_VAULT:", address(bidVault));
        console.log("REP_LEDGER:", address(repLedger));

        vm.stopBroadcast();
    }
}
