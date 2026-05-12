import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "CKB Actions Marketplace",
  description:
    "On-chain task board on Nervos CKB. Post tasks, lock rewards in cells, get paid when work is done — no platform holds your funds.",
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "CKB Actions Marketplace",
    description:
      "On-chain task board on Nervos CKB. Rewards escrowed in cells — no platform holds your funds.",
    url: BASE_URL,
    siteName: "CKB Actions Marketplace",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CKB Actions Marketplace",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CKB Actions Marketplace",
    description:
      "On-chain task board on Nervos CKB. Rewards escrowed in cells — no platform holds your funds.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var t=localStorage.getItem("ckbind-theme");var d=t?t==="dark":true;document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}}();`,
          }}
        />
      </head>
      <body>
        <Providers>
          <div className="app-shell">
            <div className="panel overflow-hidden rounded-[28px] md:rounded-[40px]">
              <Navbar />
              <main className="px-4 py-5 sm:px-6 md:px-8 md:py-8 lg:px-10">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
