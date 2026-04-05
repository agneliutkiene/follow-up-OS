import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Follow-up OS",
  description: "A lightweight follow-up tracker for solopreneurs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--app-bg)] text-[var(--ink)]">
        {children}
      </body>
    </html>
  );
}
