"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

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
    <nav aria-label="Primary">
      <ul className="flex items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-1">
        {tabs.map((tab) => {
          const active = tab.isActive(pathname);

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-w-[92px] items-center justify-center rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
                  active
                    ? "bg-[var(--surface-2)] text-[var(--text)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]",
                )}
              >
                {tab.label}
                {active ? (
                  <span className="absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-[var(--primary)]" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
