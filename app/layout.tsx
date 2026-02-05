import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prizm Lounge Production Hub | Super Bowl LX",
  description: "Production coordination for Panini America Prizm Lounge at Super Bowl LX | Feb 5-7, 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
