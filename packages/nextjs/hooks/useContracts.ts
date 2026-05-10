import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";

export const CONTRACT_ADDRESSES = {
  JOB_REGISTRY: "0xd6a56546804d7B319DA9e7720034CB55Ada8d4c6" as `0x${string}`,
  BID_VAULT:    "0x60Dd6FFEfC52b6acA422163e0E4E88174c9F7F7e" as `0x${string}`,
  REP_LEDGER:   "0xDfaA5deb44b085f4f0C187c5346622b54CE8fb84" as `0x${string}`,
} as const;

export const JOB_REGISTRY_ABI = [
  { name: "postJob", type: "function", stateMutability: "payable", inputs: [{ name: "title", type: "string" }, { name: "description", type: "string" }, { name: "encryptedBudget", type: "bytes32" }, { name: "inputProof", type: "bytes" }, { name: "deadline", type: "uint256" }], outputs: [{ name: "jobId", type: "uint256" }] },
  { name: "getJob", type: "function", stateMutability: "view", inputs: [{ name: "jobId", type: "uint256" }], outputs: [{ name: "client", type: "address" }, { name: "title", type: "string" }, { name: "description", type: "string" }, { name: "deadline", type: "uint256" }, { name: "status", type: "uint8" }, { name: "winner", type: "address" }] },
  { name: "jobCount", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "selectWinner", type: "function", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }, { name: "winner", type: "address" }], outputs: [] },
  { name: "releaseEscrow", type: "function", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }], outputs: [] },
  { name: "closeJob", type: "function", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }], outputs: [] },
] as const;

export const BID_VAULT_ABI = [
  { name: "submitBid", type: "function", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }, { name: "encryptedAmount", type: "bytes32" }, { name: "inputProof", type: "bytes" }], outputs: [] },
  { name: "getBidCount", type: "function", stateMutability: "view", inputs: [{ name: "jobId", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
  { name: "getBidders", type: "function", stateMutability: "view", inputs: [{ name: "jobId", type: "uint256" }], outputs: [{ name: "bidders", type: "address[]" }] },
] as const;

export const REP_LEDGER_ABI = [
  { name: "getPublicStats", type: "function", stateMutability: "view", inputs: [{ name: "freelancer", type: "address" }], outputs: [{ name: "ratingCount", type: "uint32" }, { name: "completedJobs", type: "uint256" }] },
] as const;

export function useJobCount() {
  return useReadContract({ address: CONTRACT_ADDRESSES.JOB_REGISTRY, abi: JOB_REGISTRY_ABI, functionName: "jobCount" });
}

export function useJob(jobId: bigint) {
  return useReadContract({ address: CONTRACT_ADDRESSES.JOB_REGISTRY, abi: JOB_REGISTRY_ABI, functionName: "getJob", args: [jobId] });
}

export function useBidCount(jobId: bigint) {
  return useReadContract({ address: CONTRACT_ADDRESSES.BID_VAULT, abi: BID_VAULT_ABI, functionName: "getBidCount", args: [jobId] });
}

export function useFreelancerStats(address: `0x${string}` | undefined) {
  return useReadContract({ address: CONTRACT_ADDRESSES.REP_LEDGER, abi: REP_LEDGER_ABI, functionName: "getPublicStats", args: address ? [address] : undefined, query: { enabled: !!address } });
}

export function useSubmitBid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  function submitBid(jobId: bigint) {
    const encryptedAmount = "0x0000000000000000000000000000000000000000000000000000000000000001" as `0x${string}`;
    writeContract({ address: CONTRACT_ADDRESSES.BID_VAULT, abi: BID_VAULT_ABI, functionName: "submitBid", args: [jobId, encryptedAmount, "0x" as `0x${string}`] });
  }
  return { submitBid, hash, isPending, isConfirming, isSuccess, error };
}

export function usePostJob() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  function postJob(title: string, description: string, deadlineTimestamp: number, escrowEth: string) {
    const encryptedBudget = "0x0000000000000000000000000000000000000000000000000000000000000001" as `0x${string}`;
    writeContract({ address: CONTRACT_ADDRESSES.JOB_REGISTRY, abi: JOB_REGISTRY_ABI, functionName: "postJob", args: [title, description, encryptedBudget, "0x" as `0x${string}`, BigInt(deadlineTimestamp)], value: parseEther(escrowEth) });
  }
  return { postJob, hash, isPending, isConfirming, isSuccess, error };
}