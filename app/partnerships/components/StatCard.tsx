import Link from 'next/link';

interface StatCardProps {
  label: string;
  value: number | string;
  detail?: string;
  href?: string;
  accentColor?: string;
}

export default function StatCard({ label, value, detail, href, accentColor }: StatCardProps) {
  const content = (
    <div className="relative overflow-hidden bg-[#141414] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#3A3A3A] transition-all group">
      {accentColor && (
        <div
          className="absolute top-0 left-0 w-full h-[2px]"
          style={{ background: accentColor }}
        />
      )}
      <p className="text-[#6B7280] text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-white mt-1.5 tracking-tight">{value}</p>
      {detail && <p className="text-[#6B7280] text-xs mt-1.5">{detail}</p>}
      {href && (
        <span className="text-[#6B7280] group-hover:text-[#9CA3AF] text-xs mt-2 inline-block transition-colors">
          View all &rarr;
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
