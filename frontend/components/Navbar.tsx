"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "./ConnectButton";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/post", label: "Create Task" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b" style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--surface) 82%, transparent)", backdropFilter: "blur(22px)" }}>
      <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <div className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-wide text-primary">CKBind</span>
            <span className="hidden truncate text-xs text-muted sm:block">Actions Marketplace</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border p-1 md:flex" style={{ borderColor: "var(--border)", background: "var(--surface-muted)" }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                pathname === link.href
                  ? "active-pill"
                  : "text-muted hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>
      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
              pathname === link.href ? "primary-button" : "text-secondary"
            }`}
            style={pathname === link.href ? undefined : { borderColor: "var(--border)", background: "var(--surface-muted)" }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function LogoMark() {
  return (
    <div
  className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border"
  style={{
    borderColor: "rgba(255,255,255,0.08)",
    background:
      "linear-gradient(145deg, rgba(37,99,235,0.95), rgba(6,182,212,0.88))",
    boxShadow: "0 14px 34px rgba(37,99,235,0.24)",
  }}
>
  <div className="absolute inset-1 rounded-[14px] border border-white/10 bg-black/10" />

  <svg
    className="relative h-7 w-7 text-white"
    viewBox="0 0 48 48"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M24 4.8 40.6 14.4v19.2L24 43.2 7.4 33.6V14.4L24 4.8Z"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinejoin="round"
    />

    <path
      d="M17.2 24c0-3.75 3.05-6.8 6.8-6.8h4.9"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />

    <path
      d="M30.8 24c0 3.75-3.05 6.8-6.8 6.8h-4.9"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />

    <path
      d="M19.1 30.8 14.6 24l4.5-6.8"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M28.9 17.2 33.4 24l-4.5 6.8"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <circle cx="24" cy="24" r="2.6" fill="currentColor" />
  </svg>
</div>
  );
}
