import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NWSL Media Day 2026 | Panini Shoot Packet",
  description: "Panini × NWSL Media Day Production Packet | January 28-29, 2026 | MG Studio, Los Angeles",
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
