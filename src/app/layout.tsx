import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://noslip.cloud"),
  title: {
    default: "NoSlip",
    template: "%s · NoSlip",
  },
  description: "NoSlip — daily follow-up digest + drafts so nothing falls through.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--bg)] text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}
