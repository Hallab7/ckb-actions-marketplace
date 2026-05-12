"use client";

import { useCcc } from "@ckb-ccc/connector-react";
import { useEffect, useState } from "react";

export function ConnectButton() {
  const { open, disconnect, signerInfo } = useCcc();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!signerInfo?.signer) {
      setAddress(null);
      return;
    }
    signerInfo.signer
      .getRecommendedAddress()
      .then(setAddress)
      .catch(() => setAddress(null));
  }, [signerInfo]);

  const short = address
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : null;

  if (address) {
    return (
      <div className="flex items-center gap-2 rounded-full border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--surface-muted)" }}>
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.65)]" />
        <span className="hidden font-mono text-xs text-secondary sm:block">
          {short}
        </span>
        <button
          onClick={disconnect}
          className="text-xs font-medium text-red-500 hover:text-primary cursor-pointer"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={open}
      className="secondary-button px-4 text-sm font-semibold"
    >
      Connect Wallet
    </button>
  );
}
