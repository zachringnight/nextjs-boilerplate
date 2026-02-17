interface StatCardProps {
  label: string;
  value: number | string;
  detail?: string;
}

export default function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
      <p className="text-[#9CA3AF] text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {detail && <p className="text-[#6B7280] text-xs mt-1">{detail}</p>}
    </div>
  );
}
