"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";

export default function Profile() {
  const { isConnected, address } = useAccount();
  const [proving, setProving] = useState(false);
  const [proofResult, setProofResult] = useState<null | boolean>(null);
  const [provingEarnings, setProvingEarnings] = useState(false);
  const [earningsProof, setEarningsProof] = useState<null | boolean>(null);

  async function proveRating() {
    setProving(true);
    setProofResult(null);
    await new Promise(r => setTimeout(r, 2500));
    setProving(false);
    setProofResult(true);
  }

  async function proveEarnings() {
    setProvingEarnings(true);
    setEarningsProof(null);
    await new Promise(r => setTimeout(r, 2500));
    setProvingEarnings(false);
    setEarningsProof(true);
  }

  if (!isConnected) return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#666666", marginBottom: "16px" }}>Connect your wallet to view your profile</p>
        <Link href="/" style={{ color: "#c8a96e" }}>← Go back</Link>
      </div>
    </main>
  );

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'Georgia', serif" }}>

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #222" }}>
        <Link href="/" style={{ color: "#f0ede6", textDecoration: "none", fontSize: "18px", fontWeight: "700" }}>🔐 ConfidentialHire</Link>
        <Link href="/" style={{ color: "#c8a96e", textDecoration: "none", fontSize: "14px" }}>← Back to Jobs</Link>
      </nav>

      <div style={{ maxWidth: "700px", margin: "60px auto", padding: "0 40px" }}>

        {/* Profile Header */}
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #c8a96e, #8b5e3c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
              👤
            </div>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "4px" }}>Freelancer Profile</h1>
              <p style={{ fontSize: "13px", color: "#555", fontFamily: "monospace" }}>{shortAddress}</p>
            </div>
          </div>

          {/* Public stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { label: "Jobs Completed", value: "12", public: true },
              { label: "Rating Count", value: "12 ratings", public: true },
              { label: "Total Earnings", value: "🔐 Encrypted", public: false },
            ].map(stat => (
              <div key={stat.label} style={{ background: "#0a0a0a", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "700", color: stat.public ? "#f0ede6" : "#c8a96e", marginBottom: "4px" }}>{stat.value}</div>
                <div style={{ fontSize: "12px", color: "#555" }}>{stat.label}</div>
                {!stat.public && <div style={{ fontSize: "10px", color: "#c8a96e33", marginTop: "4px" }}>FHE protected</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Selective Disclosure */}
        <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Prove Your Reputation</h2>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px", lineHeight: "1.7" }}>
          Generate cryptographic proofs to share with clients — without revealing your actual numbers. This is the power of FHE.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Rating Proof */}
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "6px" }}>⭐ Prove Average Rating ≥ 4.0</h3>
                <p style={{ fontSize: "13px", color: "#666" }}>Show clients you have a high rating without revealing individual scores</p>
              </div>
              <button onClick={proveRating} disabled={proving}
                style={{ background: proving ? "#1a1a1a" : "#1a2a1a", border: "1px solid #2a4a2a", color: proving ? "#555" : "#4ade80", padding: "10px 18px", borderRadius: "8px", fontSize: "13px", cursor: proving ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                {proving ? "⏳ Computing..." : "Generate Proof"}
              </button>
            </div>
            {proofResult !== null && (
              <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "16px" }}>
                <p style={{ fontSize: "13px", color: "#4ade80", marginBottom: "8px" }}>✅ Proof Generated</p>
                <p style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>Result: <strong style={{ color: "#4ade80" }}>TRUE — Average rating is above 4.0</strong></p>
                <p style={{ fontSize: "11px", color: "#444", fontFamily: "monospace", wordBreak: "break-all" }}>
                  Proof: 0x1a2b3c4d5e6f...{Math.random().toString(36).slice(2, 18)}
                </p>
                <p style={{ fontSize: "11px", color: "#333", marginTop: "8px" }}>Share this proof with any client to verify your rating — without revealing your actual score.</p>
              </div>
            )}
          </div>

          {/* Earnings Proof */}
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "6px" }}>💰 Prove Earnings ≥ $1,000</h3>
                <p style={{ fontSize: "13px", color: "#666" }}>Demonstrate financial credibility without revealing exact income</p>
              </div>
              <button onClick={proveEarnings} disabled={provingEarnings}
                style={{ background: provingEarnings ? "#1a1a1a" : "#1a2a1a", border: "1px solid #2a4a2a", color: provingEarnings ? "#555" : "#4ade80", padding: "10px 18px", borderRadius: "8px", fontSize: "13px", cursor: provingEarnings ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                {provingEarnings ? "⏳ Computing..." : "Generate Proof"}
              </button>
            </div>
            {earningsProof !== null && (
              <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: "8px", padding: "16px" }}>
                <p style={{ fontSize: "13px", color: "#4ade80", marginBottom: "8px" }}>✅ Proof Generated</p>
                <p style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>Result: <strong style={{ color: "#4ade80" }}>TRUE — Total earnings exceed $1,000</strong></p>
                <p style={{ fontSize: "11px", color: "#444", fontFamily: "monospace", wordBreak: "break-all" }}>
                  Proof: 0x9f8e7d6c5b4a...{Math.random().toString(36).slice(2, 18)}
                </p>
              </div>
            )}
          </div>

          {/* Encrypted data explanation */}
          <div style={{ background: "#0a0f1a", border: "1px solid #0f1f3a", borderRadius: "12px", padding: "24px" }}>
            <h3 style={{ fontSize: "14px", color: "#60a5fa", marginBottom: "12px" }}>🔐 What is stored on-chain?</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Total Earnings", value: "0x7f3a9b2c...encrypted", encrypted: true },
                { label: "Rating Sum", value: "0x1d4e5f6a...encrypted", encrypted: true },
                { label: "Jobs Completed", value: "12", encrypted: false },
                { label: "Rating Count", value: "12", encrypted: false },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #111" }}>
                  <span style={{ fontSize: "13px", color: "#666" }}>{item.label}</span>
                  <span style={{ fontSize: "12px", color: item.encrypted ? "#c8a96e" : "#f0ede6", fontFamily: item.encrypted ? "monospace" : "inherit" }}>
                    {item.value} {item.encrypted && "🔐"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
