import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CKBind | Actions Marketplace",
  description: "Professional on-chain task dashboard powered by CKB",
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
