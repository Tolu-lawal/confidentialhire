"use client";

import { useAccount, useReadContract } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/helper/RainbowKitCustomConnectButton";
import Link from "next/link";

const JOB_REGISTRY = "0xd6a56546804d7B319DA9e7720034CB55Ada8d4c6" as `0x${string}`;
const BID_VAULT = "0x60Dd6FFEfC52b6acA422163e0E4E88174c9F7F7e" as `0x${string}`;

const JOB_REGISTRY_ABI = [
  { name: "jobCount", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256" }] },
  { name: "getJob", type: "function", stateMutability: "view", inputs: [{ name: "jobId", type: "uint256" }], outputs: [{ name: "client", type: "address" }, { name: "title", type: "string" }, { name: "description", type: "string" }, { name: "deadline", type: "uint256" }, { name: "status", type: "uint8" }, { name: "winner", type: "address" }] },
] as const;

const BID_VAULT_ABI = [
  { name: "getBidCount", type: "function", stateMutability: "view", inputs: [{ name: "jobId", type: "uint256" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

function JobCard({ jobId }: { jobId: bigint }) {
  const { data: job } = useReadContract({ address: JOB_REGISTRY, abi: JOB_REGISTRY_ABI, functionName: "getJob", args: [jobId] });
  const { data: bidCount } = useReadContract({ address: BID_VAULT, abi: BID_VAULT_ABI, functionName: "getBidCount", args: [jobId] });

  if (!job) return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "24px" }}>
      <div style={{ color: "#444", fontSize: "13px" }}>Loading job #{jobId.toString()}...</div>
    </div>
  );

  const [client, title, description, deadline, status] = job;
  const deadlineDate = new Date(Number(deadline) * 1000).toLocaleDateString();
  const statusLabel = ["Open", "Closed", "Completed"][status] ?? "Unknown";
  const isOpen = status === 0;

  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#c8a96e44")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "#1e1e1e")}>
      <div>
        <div style={{ fontSize: "17px", fontWeight: "600", marginBottom: "6px" }}>{title}</div>
        <div style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>{description}</div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "#555" }}>⏰ {deadlineDate}</span>
          <span style={{ fontSize: "12px", color: "#555" }}>👤 {bidCount?.toString() ?? "0"} bids</span>
          <span style={{ fontSize: "12px", color: isOpen ? "#c8a96e" : "#555", background: isOpen ? "#c8a96e11" : "#1a1a1a", padding: "2px 8px", borderRadius: "20px" }}>{statusLabel}</span>
          <span style={{ fontSize: "11px", color: "#333", fontFamily: "monospace" }}>by {client.slice(0, 6)}...{client.slice(-4)}</span>
        </div>
      </div>
      {isOpen && (
        <Link href={`/bid/${jobId.toString()}`} style={{ background: "transparent", border: "1px solid #c8a96e", color: "#c8a96e", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", whiteSpace: "nowrap", marginLeft: "24px" }}>
          Submit Bid →
        </Link>
      )}
    </div>
  );
}

function JobList({ count }: { count: bigint }) {
  const ids = Array.from({ length: Number(count) }, (_, i) => BigInt(i));
  if (ids.length === 0) return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "48px", textAlign: "center" }}>
      <p style={{ color: "#555" }}>No jobs posted yet. Be the first!</p>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {ids.reverse().map(id => <JobCard key={id.toString()} jobId={id} />)}
    </div>
  );
}

export default function Home() {
  const { isConnected } = useAccount();
  const { data: jobCount, isLoading } = useReadContract({ address: JOB_REGISTRY, abi: JOB_REGISTRY_ABI, functionName: "jobCount" });

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", fontFamily: "'Georgia', serif" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #222" }}>
        <span style={{ fontSize: "22px", fontWeight: "700" }}>🔐 confidentialHire</span>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {isConnected && <>
            <Link href="/post-job" style={{ color: "#c8a96e", textDecoration: "none", fontSize: "14px" }}>Post a Job</Link>
            <Link href="/profile" style={{ color: "#c8a96e", textDecoration: "none", fontSize: "14px" }}>My Profile</Link>
          </>}
          <RainbowKitCustomConnectButton />
        </div>
      </nav>

      <section style={{ textAlign: "center", padding: "80px 40px 60px", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ display: "inline-block", background: "#1a1a1a", border: "1px solid #c8a96e33", borderRadius: "20px", padding: "6px 16px", fontSize: "12px", color: "#c8a96e", marginBottom: "24px", letterSpacing: "1px", textTransform: "uppercase" }}>
          Powered by Fully Homomorphic Encryption · Sepolia Testnet
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 72px)", fontWeight: "700", letterSpacing: "-2px", lineHeight: "1.1", marginBottom: "20px" }}>
          Freelance work.<br /><span style={{ color: "#c8a96e" }}>Completely private.</span>
        </h1>
        <p style={{ fontSize: "18px", color: "#888", maxWidth: "540px", margin: "0 auto 40px", lineHeight: "1.7" }}>
          Bid on jobs without revealing your price. Prove your reputation without exposing your earnings.
        </p>
        {!isConnected && <div style={{ display: "flex", justifyContent: "center" }}><RainbowKitCustomConnectButton /></div>}
      </section>

      <section style={{ padding: "60px 40px", maxWidth: "900px", margin: "0 auto", borderBottom: "1px solid #1a1a1a" }}>
        <h2 style={{ fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", color: "#555", marginBottom: "40px", textAlign: "center" }}>How it works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px" }}>
          {[
            { step: "01", title: "Client posts a job", desc: "Budget is encrypted — nobody knows the max they'll pay" },
            { step: "02", title: "Freelancers bid", desc: "Bid amounts stay hidden from all competitors permanently" },
            { step: "03", title: "Winner selected", desc: "FHE comparison picks lowest bid without decrypting any" },
            { step: "04", title: "Reputation grows", desc: "Ratings stored encrypted — prove quality without disclosure" },
          ].map(item => (
            <div key={item.step} style={{ padding: "24px", background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px" }}>
              <div style={{ fontSize: "11px", color: "#c8a96e", letterSpacing: "2px", marginBottom: "12px" }}>{item.step}</div>
              <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "8px" }}>{item.title}</div>
              <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.6" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "60px 40px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "4px" }}>Live Jobs</h2>
            <p style={{ fontSize: "13px", color: "#555" }}>{isLoading ? "Loading from Sepolia..." : `${jobCount?.toString() ?? "0"} jobs on-chain`}</p>
          </div>
          {isConnected && (
            <Link href="/post-job" style={{ background: "#c8a96e", color: "#0a0a0a", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>+ Post a Job</Link>
          )}
        </div>
        {!isConnected ? (
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "48px", textAlign: "center" }}>
            <p style={{ color: "#555", marginBottom: "20px" }}>Connect your wallet to see live jobs</p>
            <RainbowKitCustomConnectButton />
          </div>
        ) : isLoading ? (
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "48px", textAlign: "center" }}>
            <p style={{ color: "#555" }}>⏳ Loading jobs from Sepolia blockchain...</p>
          </div>
        ) : (
          <JobList count={jobCount ?? 0n} />
        )}
      </section>

      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "32px 40px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#444" }}>
          ConfidentialHire · Built for Zama Developer Bounty Season 2 ·{" "}
          <a href="https://sepolia.etherscan.io/address/0xd6a56546804d7B319DA9e7720034CB55Ada8d4c6" target="_blank" style={{ color: "#c8a96e", textDecoration: "none" }}>View Contracts ↗</a>
        </p>
      </footer>
    </main>
  );
}