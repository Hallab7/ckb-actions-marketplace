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
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
        <span className="text-sm text-gray-700 font-mono hidden sm:block">
          {short}
        </span>
        <button
          onClick={disconnect}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={open}
      className="text-sm font-medium px-4 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
    >
      Connect Wallet
    </button>
  );
}
