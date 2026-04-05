"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
};

const tabs: Tab[] = [
  {
    href: "/inbox",
    label: "Inbox",
    isActive: (pathname) => pathname === "/inbox" || pathname.startsWith("/threads/"),
  },
  {
    href: "/contacts",
    label: "Contacts",
    isActive: (pathname) => pathname.startsWith("/contacts"),
  },
  {
    href: "/settings",
    label: "Settings",
    isActive: (pathname) => pathname.startsWith("/settings"),
  },
];

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="inline-flex rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-1">
      {tabs.map((tab) => {
        const active = tab.isActive(pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm"
                : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
