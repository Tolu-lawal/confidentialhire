const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with wallet:", deployer.address);

  // 1. Deploy BidVault
  const BidVault = await ethers.getContractFactory("BidVault");
  const bidVault = await BidVault.deploy(ethers.ZeroAddress);
  await bidVault.waitForDeployment();
  console.log("BidVault deployed to:", await bidVault.getAddress());

  // 2. Deploy ReputationLedger
  const ReputationLedger = await ethers.getContractFactory("ReputationLedger");
  const repLedger = await ReputationLedger.deploy(ethers.ZeroAddress);
  await repLedger.waitForDeployment();
  console.log("ReputationLedger deployed to:", await repLedger.getAddress());

  // 3. Deploy JobRegistry with real addresses
  const JobRegistry = await ethers.getContractFactory("JobRegistry");
  const jobRegistry = await JobRegistry.deploy(
    await bidVault.getAddress(),
    await repLedger.getAddress()
  );
  await jobRegistry.waitForDeployment();
  console.log("JobRegistry deployed to:", await jobRegistry.getAddress());

  console.log("\n--- SAVE THESE ADDRESSES ---");
  console.log("JOB_REGISTRY =", await jobRegistry.getAddress());
  console.log("BID_VAULT =", await bidVault.getAddress());
  console.log("REP_LEDGER =", await repLedger.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});