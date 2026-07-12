import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Senior Bowl | Earned Media Recap - Panini America",
  description:
    "Panini America Senior Bowl earned media recap. Watch all TV segments and coverage from the February 2026 Senior Bowl.",
  openGraph: {
    title: "Senior Bowl | Earned Media Recap",
    description:
      "Panini America Senior Bowl earned media recap featuring TV coverage segments.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SeniorBowlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
