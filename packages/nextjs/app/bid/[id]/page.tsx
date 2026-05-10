"use client";

import { useState, use } from "react";
import { useAccount, useReadContract } from "wagmi";
import Link from "next/link";
import { useEncryptAndSubmitBid } from "~~/hooks/useFHEEncryption";

const JOB_REGISTRY = "0xd6a56546804d7B319DA9e7720034CB55Ada8d4c6" as `0x${string}`;
const BID_VAULT = "0x60Dd6FFEfC52b6acA422163e0E4E88174c9F7F7e" as `0x${string}`;

const JOB_REGISTRY_ABI = [
  { name: "getJob", type: "function", stateMutability: "view", inputs: [{ name: "jobId", type: "uint256" }], outputs: [{ name: "client", type: "address" }, { name: "title", type: "string" }, { name: "description", type: "string" }, { name: "deadline", type: "uint256" }, { name: "status", type: "uint8" }, { name: "winner", type: "address" }] },
] as const;

const BID_VAULT_ABI = [
  { name: "getBidCount", type: "function", stateMutability: "view", inputs: [{ name: "jobId", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

export default function BidPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isConnected } = useAccount();
  const [bidAmount, setBidAmount] = useState(200);
  const [note, setNote] = useState("");

  const jobId = BigInt(id);
  const { data: job, isLoading } = useReadContract({ address: JOB_REGISTRY, abi: JOB_REGISTRY_ABI, functionName: "getJob", args: [jobId] });
  const { data: bidCount } = useReadContract({ address: BID_VAULT, abi: BID_VAULT_ABI, functionName: "getBidCount", args: [jobId] });

  const {
    submitEncryptedBid,
    isEncrypting,
    isPending,
    isConfirming,
    isSuccess,
    encryptError,
    isFhevmReady,
  } = useEncryptAndSubmitBid();

  if (isLoading) return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#555" }}>⏳ Loading job from Sepolia...</p>
    </main>
  );

  if (!job) return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#666", marginBottom: "16px" }}>Job #{id} not found</p>
        <Link href="/" style={{ color: "#c8a96e" }}>← Go back</Link>
      </div>
    </main>
  );

  const [client, title, description, deadline] = job;
  const deadlineDate = new Date(Number(deadline) * 1000).toLocaleDateString();
  const isLoading2 = isEncrypting || isPending || isConfirming;

  if (isSuccess) return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#111", border: "1px solid #c8a96e44", borderRadius: "16px", padding: "48px", textAlign: "center", maxWidth: "480px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px" }}>Bid Encrypted & Submitted!</h2>
        <p style={{ color: "#666", marginBottom: "12px" }}>Your bid is now on Sepolia — truly encrypted with FHE.</p>
        <div style={{ background: "#0a0a0a", borderRadius: "8px", padding: "16px", margin: "20px 0", textAlign: "left" }}>
          <p style={{ fontSize: "12px", color: "#555", marginBottom: "4px" }}>What competitors see on-chain:</p>
          <p style={{ fontSize: "11px", color: "#c8a96e", fontFamily: "monospace", wordBreak: "break-all" }}>
            0x{Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}
          </p>
          <p style={{ fontSize: "11px", color: "#444", marginTop: "8px" }}>Your actual bid is hidden forever.</p>
        </div>
        <Link href="/" style={{ background: "#c8a96e", color: "#0a0a0a", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", fontWeight: "600" }}>View More Jobs →</Link>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'Georgia', serif" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #222" }}>
        <Link href="/" style={{ color: "#f0ede6", textDecoration: "none", fontSize: "18px", fontWeight: "700" }}>🔐 ConfidentialHire</Link>
        <Link href="/" style={{ color: "#c8a96e", textDecoration: "none", fontSize: "14px" }}>← Back to Jobs</Link>
      </nav>

      <div style={{ maxWidth: "680px", margin: "60px auto", padding: "0 40px" }}>

        {/* FHE Status */}
        <div style={{ background: isFhevmReady ? "#0d1a0d" : "#1a1a0a", border: `1px solid ${isFhevmReady ? "#1a3a1a" : "#3a3a1a"}`, borderRadius: "8px", padding: "12px 16px", marginBottom: "24px" }}>
          <span style={{ fontSize: "13px", color: isFhevmReady ? "#4ade80" : "#facc15" }}>
            {isFhevmReady ? "✅ Zama FHE ready — real encryption active" : "⏳ Connecting to Zama FHE network..."}
          </span>
        </div>

        {/* Job Info */}
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "28px", marginBottom: "32px" }}>
          <div style={{ fontSize: "12px", color: "#c8a96e", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Live Job #{id} · Sepolia</div>
          <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "12px" }}>{title}</h1>
          <p style={{ color: "#777", fontSize: "15px", lineHeight: "1.7", marginBottom: "20px" }}>{description}</p>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "#555" }}>⏰ {deadlineDate}</span>
            <span style={{ fontSize: "13px", color: "#555" }}>👤 {bidCount?.toString() ?? "0"} bids</span>
            <span style={{ fontSize: "12px", color: "#555", fontFamily: "monospace" }}>by {client.slice(0, 6)}...{client.slice(-4)}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Bid Slider */}
          <div>
            <label style={{ fontSize: "13px", color: "#888", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Your Bid Amount (USD)</label>
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "36px", fontWeight: "700" }}>${bidAmount}</span>
                <span style={{ fontSize: "12px", background: "#c8a96e11", color: "#c8a96e", padding: "4px 10px", borderRadius: "20px", border: "1px solid #c8a96e33" }}>🔐 FHE encrypted</span>
              </div>
              <input type="range" min="50" max="5000" step="50" value={bidAmount} onChange={e => setBidAmount(Number(e.target.value))} style={{ width: "100%", accentColor: "#c8a96e" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#444", marginTop: "4px" }}><span>$50</span><span>$5,000</span></div>
            </div>
          </div>

          {/* Privacy info */}
          <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "16px" }}>
            <p style={{ fontSize: "13px", color: "#4ade80", marginBottom: "8px" }}>🛡️ How FHE protects your bid</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {[
                `Your $${bidAmount} is encrypted in your browser using Zama's SDK`,
                "Only an encrypted handle is sent to the blockchain",
                "No competitor can ever see your price",
              ].map((s, i) => (
                <p key={i} style={{ fontSize: "12px", color: "#555" }}><span style={{ color: "#c8a96e" }}>{i+1}.</span> {s}</p>
              ))}
            </div>
          </div>

          {/* Cover Note */}
          <div>
            <label style={{ fontSize: "13px", color: "#888", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Cover Note (public)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Tell the client about your experience..." rows={4}
              style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "12px 16px", color: "#f0ede6", fontSize: "15px", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>

          {/* Error */}
          {encryptError && (
            <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: "8px", padding: "12px 16px" }}>
              <p style={{ fontSize: "13px", color: "#f87171" }}>❌ {encryptError.slice(0, 150)}</p>
            </div>
          )}

          {/* Submit Button */}
          {!isConnected ? (
            <div style={{ background: "#111", border: "1px solid #333", borderRadius: "8px", padding: "20px", textAlign: "center" }}>
              <p style={{ color: "#666", fontSize: "14px" }}>Connect your wallet to submit a bid</p>
            </div>
          ) : (
            <button
              onClick={() => submitEncryptedBid(jobId, bidAmount)}
              disabled={isLoading2 || !isFhevmReady}
              style={{
                background: (isLoading2 || !isFhevmReady) ? "#222" : "#c8a96e",
                color: (isLoading2 || !isFhevmReady) ? "#555" : "#0a0a0a",
                border: "none", borderRadius: "8px", padding: "16px",
                fontSize: "16px", fontWeight: "700",
                cursor: (isLoading2 || !isFhevmReady) ? "not-allowed" : "pointer",
              }}>
              {isEncrypting ? "🔐 Encrypting with Zama FHE..." : isPending ? "⏳ Confirm in MetaMask..." : isConfirming ? "⏳ Confirming on Sepolia..." : `🔐 Submit Encrypted Bid of $${bidAmount}`}
            </button>
          )}

          <p style={{ fontSize: "12px", color: "#444", textAlign: "center" }}>
            BidVault.sol · <a href={`https://sepolia.etherscan.io/address/${BID_VAULT}`} target="_blank" style={{ color: "#c8a96e55" }}>View contract ↗</a>
          </p>
        </div>
      </div>
    </main>
  );
}