"use client";
import { useCallback, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useEncrypt } from "@zama-fhe/react-sdk";
import { CONTRACT_ADDRESSES, BID_VAULT_ABI, JOB_REGISTRY_ABI } from "~~/hooks/useContracts";
import { parseEther } from "viem";

export function useEncryptAndSubmitBid() {
  const { address } = useAccount();
  const { mutateAsync: encrypt, isPending: isEncrypting } = useEncrypt();
  const [encryptError, setEncryptError] = useState<string | null>(null);
  const [isFhevmReady] = useState(true);
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const submitEncryptedBid = useCallback(async (jobId: bigint, bidAmountUsd: number) => {
    if (!address) { setEncryptError("No wallet connected"); return; }
    setEncryptError(null);
    try {
      const encrypted = await encrypt({
        contractAddress: CONTRACT_ADDRESSES.BID_VAULT,
        userAddress: address,
        values: [{ type: "euint64" as const, value: BigInt(bidAmountUsd * 100) }],
      });
      const handle = `0x${Array.from(encrypted.handles[0]).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;
      const proof = `0x${Array.from(encrypted.inputProof).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;
      writeContract({
        address: CONTRACT_ADDRESSES.BID_VAULT,
        abi: BID_VAULT_ABI,
        functionName: "submitBid",
        args: [jobId, handle, proof],
      });
    } catch (err: unknown) {
      setEncryptError(err instanceof Error ? err.message : "Encryption failed");
    }
  }, [address, encrypt, writeContract]);

  return { submitEncryptedBid, isEncrypting, isPending, isConfirming, isSuccess, encryptError: encryptError || (writeError?.message ?? null), isFhevmReady };
}

export function useEncryptAndPostJob() {
  const { address } = useAccount();
  const { mutateAsync: encrypt, isPending: isEncrypting } = useEncrypt();
  const [encryptError, setEncryptError] = useState<string | null>(null);
  const [isFhevmReady] = useState(true);
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const postJobEncrypted = useCallback(async (
    title: string, description: string, budgetUsd: number,
    deadlineTimestamp: number, escrowEth: string,
  ) => {
    if (!address) { setEncryptError("No wallet connected"); return; }
    setEncryptError(null);
    try {
      const encrypted = await encrypt({
        contractAddress: CONTRACT_ADDRESSES.JOB_REGISTRY,
        userAddress: address,
        values: [{ type: "euint64" as const, value: BigInt(budgetUsd * 100) }],
      });
      const handle = `0x${Array.from(encrypted.handles[0]).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;
      const proof = `0x${Array.from(encrypted.inputProof).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;
      writeContract({
        address: CONTRACT_ADDRESSES.JOB_REGISTRY,
        abi: JOB_REGISTRY_ABI,
        functionName: "postJob",
        args: [title, description, handle, proof, BigInt(deadlineTimestamp)],
        value: parseEther(escrowEth),
      });
    } catch (err: unknown) {
      setEncryptError(err instanceof Error ? err.message : "Encryption failed");
    }
  }, [address, encrypt, writeContract]);

  return { postJobEncrypted, isEncrypting, isPending, isConfirming, isSuccess, encryptError: encryptError || (writeError?.message ?? null), isFhevmReady };
}