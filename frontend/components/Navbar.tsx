"use client";

import Image from "next/image";
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
    <Image
  src="/logo.svg"
  alt="CKBind Logo"
  width={44}
  height={44}
  className="h-11 w-11 object-contain"
  priority
/>
  );
}
