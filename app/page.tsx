import Link from 'next/link';

const apps = [
  {
    name: 'Partnerships',
    href: '/partnerships',
    description: 'Athlete contracts, obligations, and partnership tracking',
    icon: '🤝',
    color: '#FFD100',
  },
  {
    name: 'ASW 2026',
    href: '/asw',
    description: 'NBA All-Star Weekend production hub — Los Angeles',
    icon: '🏀',
    color: '#FF6B35',
  },
  {
    name: 'Prizm Lounge',
    href: '/prizm',
    description: 'Super Bowl LX production hub — San Francisco',
    icon: '🏈',
    color: '#00C2FF',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Panini Production Hub</h1>
          <p className="text-[#6B7280] text-sm">Select a workspace</p>
        </div>

        <div className="space-y-3">
          {apps.map((app) => (
            <Link
              key={app.href}
              href={app.href}
              className="block bg-[#141414] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#FFD100]/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{app.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-semibold group-hover:text-[#FFD100] transition-colors">
                    {app.name}
                  </h2>
                  <p className="text-[#6B7280] text-sm mt-0.5">{app.description}</p>
                </div>
                <span className="text-[#6B7280] group-hover:text-[#9CA3AF] transition-colors">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
