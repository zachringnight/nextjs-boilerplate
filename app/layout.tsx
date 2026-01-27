import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NWSL Media Day 2026 | Panini Shoot Packet",
  description: "PANINI x NWSL x NWSLPA - Media Day Shoot Packet: Stations + Content Strategy",
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
