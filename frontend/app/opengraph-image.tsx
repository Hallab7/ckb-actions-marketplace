import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CKB Actions Marketplace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 22,
            background: "linear-gradient(145deg, rgba(37,99,235,0.95), rgba(6,182,212,0.88))",
            boxShadow: "0 14px 34px rgba(37,99,235,0.4)",
            marginBottom: 32,
          }}
        >
          <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
            <path d="M24 4.8 40.6 14.4v19.2L24 43.2 7.4 33.6V14.4L24 4.8Z" stroke="white" stroke-width="2.6" stroke-linejoin="round" />
            <path d="M17.2 24c0-3.75 3.05-6.8 6.8-6.8h4.9" stroke="white" stroke-width="3" stroke-linecap="round" />
            <path d="M30.8 24c0 3.75-3.05 6.8-6.8 6.8h-4.9" stroke="white" stroke-width="3" stroke-linecap="round" />
            <path d="M19.1 30.8 14.6 24l4.5-6.8" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M28.9 17.2 33.4 24l-4.5 6.8" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="24" cy="24" r="2.6" fill="white" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.1,
            marginBottom: 20,
            letterSpacing: "-1px",
          }}
        >
          CKB Actions
          <br />
          Marketplace
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            color: "rgba(148,163,184,1)",
            fontWeight: 400,
            marginBottom: 48,
            maxWidth: 700,
          }}
        >
          On-chain task board on Nervos CKB. Rewards escrowed in cells — no platform holds your funds.
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 12 }}>
          {["Rust Scripts", "CKB Testnet", "CCC SDK", "Next.js"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(203,213,225,1)",
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
