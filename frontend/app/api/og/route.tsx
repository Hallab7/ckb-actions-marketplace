import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(_req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "22px",
            background: "linear-gradient(145deg, #2563eb, #06b6d4)",
            boxShadow: "0 14px 34px rgba(37,99,235,0.4)",
            marginBottom: "32px",
          }}
        >
          <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 4.8 40.6 14.4v19.2L24 43.2 7.4 33.6V14.4L24 4.8Z"
              stroke="white"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            <path
              d="M17.2 24c0-3.75 3.05-6.8 6.8-6.8h4.9"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M30.8 24c0 3.75-3.05 6.8-6.8 6.8h-4.9"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M19.1 30.8 14.6 24l4.5-6.8"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M28.9 17.2 33.4 24l-4.5 6.8"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="24" r="2.6" fill="white" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "white",
            lineHeight: 1.1,
            marginBottom: "20px",
            letterSpacing: "-1px",
          }}
        >
          CKBind
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "26px",
            color: "#94a3b8",
            fontWeight: 400,
            marginBottom: "48px",
            maxWidth: "700px",
          }}
        >
          On-chain task board on Nervos CKB. Rewards escrowed in cells — no
          platform holds your funds.
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: "12px" }}>
          {["Rust Scripts", "CKB Testnet", "CCC SDK", "Next.js"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 18px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.07)",
                color: "#cbd5e1",
                fontSize: "18px",
                fontWeight: 500,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
