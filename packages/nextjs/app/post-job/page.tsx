"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useEncryptAndPostJob } from "~~/hooks/useFHEEncryption";

export default function PostJob() {
  const { isConnected } = useAccount();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(500);
  const [deadline, setDeadline] = useState("");
  const [escrow, setEscrow] = useState("0.01");

  const { postJobEncrypted, isEncrypting, isPending, isConfirming, isSuccess, encryptError } = useEncryptAndPostJob();

  async function handleSubmit() {
    if (!title || !description || !deadline) return alert("Please fill in all fields");
    const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
    await postJobEncrypted(title, description, budget, deadlineTimestamp, escrow);
  }

  if (isSuccess) return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#111", border: "1px solid #c8a96e44", borderRadius: "16px", padding: "48px", textAlign: "center", maxWidth: "480px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
        <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px" }}>Job Posted on Sepolia!</h2>
        <p style={{ color: "#666", marginBottom: "8px" }}>Your job is now live on the blockchain.</p>
        <p style={{ color: "#c8a96e", fontSize: "13px", marginBottom: "32px" }}>Budget encrypted with FHE — zero knowledge exposed.</p>
        <Link href="/" style={{ background: "#c8a96e", color: "#0a0a0a", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", fontWeight: "600" }}>View Job Board →</Link>
      </div>
    </main>
  );

  if (!isConnected) return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#666", marginBottom: "16px" }}>Please connect your wallet first</p>
        <Link href="/" style={{ color: "#c8a96e" }}>← Go back</Link>
      </div>
    </main>
  );

  const isBusy = isEncrypting || isPending || isConfirming;

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'Georgia', serif" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #222" }}>
        <Link href="/" style={{ color: "#f0ede6", textDecoration: "none", fontSize: "18px", fontWeight: "700" }}>🔐 ConfidentialHire</Link>
        <Link href="/" style={{ color: "#c8a96e", textDecoration: "none", fontSize: "14px" }}>← Back to Jobs</Link>
      </nav>
      <div style={{ maxWidth: "600px", margin: "60px auto", padding: "0 40px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>Post a Job</h1>
        <p style={{ color: "#666", marginBottom: "40px", fontSize: "15px" }}>Your budget is encrypted on-chain — freelancers cannot see your maximum price.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={{ fontSize: "13px", color: "#888", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Job Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Build a Confidential Voting DApp"
              style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "12px 16px", color: "#f0ede6", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#888", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the work, requirements, deliverables..." rows={4}
              style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "12px 16px", color: "#f0ede6", fontSize: "15px", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#888", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Maximum Budget (encrypted)</label>
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span style={{ fontSize: "28px", fontWeight: "700", color: "#c8a96e" }}>${budget}</span>
                <span style={{ fontSize: "12px", background: "#c8a96e11", color: "#c8a96e", padding: "4px 10px", borderRadius: "20px", border: "1px solid #c8a96e33" }}>🔐 Encrypted with FHE</span>
              </div>
              <input type="range" min="100" max="10000" step="100" value={budget} onChange={e => setBudget(Number(e.target.value))} style={{ width: "100%", accentColor: "#c8a96e" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#444", marginTop: "4px" }}>
                <span>$100</span><span>$10,000</span>
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#888", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Bid Deadline</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "12px 16px", color: "#f0ede6", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: "13px", color: "#888", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Escrow Deposit (ETH)</label>
            <input type="number" value={escrow} onChange={e => setEscrow(e.target.value)} step="0.001" min="0.001"
              style={{ width: "100%", background: "#111", border: "1px solid #222", borderRadius: "8px", padding: "12px 16px", color: "#f0ede6", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
          </div>
          {encryptError && (
            <div style={{ background: "#1a0a0a", border: "1px solid #3a1a1a", borderRadius: "8px", padding: "12px 16px" }}>
              <p style={{ fontSize: "13px", color: "#f87171" }}>❌ {encryptError.slice(0, 120)}</p>
            </div>
          )}
          <button onClick={handleSubmit} disabled={isBusy}
            style={{ background: isBusy ? "#333" : "#c8a96e", color: "#0a0a0a", border: "none", borderRadius: "8px", padding: "16px", fontSize: "16px", fontWeight: "700", cursor: isBusy ? "not-allowed" : "pointer" }}>
            {isEncrypting ? "🔐 Encrypting budget with FHE..." : isPending ? "⏳ Confirm in MetaMask..." : isConfirming ? "⏳ Waiting for blockchain..." : "🔐 Post Job with Encrypted Budget"}
          </button>
          <p style={{ fontSize: "12px", color: "#444", textAlign: "center" }}>Sepolia testnet · Chain ID 11155111</p>
        </div>
      </div>
    </main>
  );
}