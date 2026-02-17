import Link from 'next/link';
import { Handshake, Zap, Trophy, ChevronRight, type LucideIcon } from 'lucide-react';

const apps: { name: string; href: string; description: string; icon: LucideIcon; color: string }[] = [
  {
    name: 'Partnerships',
    href: '/partnerships',
    description: 'Athlete contracts, obligations, and partnership tracking',
    icon: Handshake,
    color: '#FFD100',
  },
  {
    name: 'ASW 2026',
    href: '/asw',
    description: 'NBA All-Star Weekend production hub — Los Angeles',
    icon: Zap,
    color: '#FF6B35',
  },
  {
    name: 'Prizm Lounge',
    href: '/prizm',
    description: 'Super Bowl LX production hub — San Francisco',
    icon: Trophy,
    color: '#00C2FF',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">Panini Production Hub</h1>
          <p className="text-text-muted text-sm">Select a workspace</p>
        </div>

        <div className="space-y-3">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.href}
                href={app.href}
                className="block bg-surface-2 border border-border-default rounded-xl p-5 hover:border-accent-gold/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{ backgroundColor: `${app.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: app.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-text-primary font-semibold group-hover:text-accent-gold transition-colors">
                      {app.name}
                    </h2>
                    <p className="text-text-muted text-sm mt-0.5">{app.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-text-tertiary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
