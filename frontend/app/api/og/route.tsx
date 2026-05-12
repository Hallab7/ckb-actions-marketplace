import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const baseUrl = req.nextUrl.origin;
  const logoUrl = `${baseUrl}/logo.png`;

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
        {/* Logo */}
        <div
          style={{
            display: "flex",
            width: "80px",
            height: "80px",
            borderRadius: "18px",
            overflow: "hidden",
            marginBottom: "32px",
            boxShadow: "0 14px 34px rgba(37,99,235,0.4)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoUrl} width="80" height="80" alt="logo" style={{ objectFit: "cover" }} />
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
          CKB Actions Marketplace
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
