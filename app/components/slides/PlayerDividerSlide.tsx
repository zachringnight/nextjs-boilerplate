import StationIcon from '../StationIcon';

interface PlayerDividerSlideProps {
  playerNumber: number;
  totalPlayers: number;
  group: number;
  groupTime: string;
  name: string;
  subtitle: string;
}

export default function PlayerDividerSlide({
  playerNumber,
  totalPlayers,
  group,
  groupTime,
  name,
  subtitle,
}: PlayerDividerSlideProps) {
  const stations: Array<'field' | 'social' | 'vnr' | 'packRip'> = ['field', 'social', 'vnr', 'packRip'];

  const groupColors = {
    1: 'from-green-500/10 to-blue-500/10',
    2: 'from-amber-500/10 to-pink-500/10',
    3: 'from-violet-500/10 to-amber-500/10',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 text-center relative overflow-hidden">
      {/* Background gradient based on group */}
      <div className={`absolute inset-0 bg-gradient-to-br ${groupColors[group as keyof typeof groupColors] || groupColors[1]} pointer-events-none`} />

      <div className="relative z-10">
        {/* Player number badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] mb-8">
          <span className="text-2xl font-bold text-amber-400">{String(playerNumber).padStart(2, '0')}</span>
          <span className="text-gray-600">/</span>
          <span className="text-gray-500">{totalPlayers}</span>
        </div>

        <p className="text-sm tracking-[0.2em] text-gray-500 font-semibold mb-4">
          GROUP {group} • {groupTime}
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tight">
          {name}
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 tracking-wide">{subtitle}</p>

        {/* Stations this player will visit */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.15em] text-gray-600 mb-4 uppercase">
            Interview Stations
          </p>
          <div className="flex gap-6 justify-center">
            {stations.map((station) => (
              <StationIcon key={station} station={station} size="md" showLabel />
            ))}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-1.5 mt-8">
          {Array.from({ length: totalPlayers }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i + 1 === playerNumber
                  ? 'w-6 bg-amber-500'
                  : i + 1 < playerNumber
                    ? 'w-3 bg-gray-600'
                    : 'w-3 bg-gray-800'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
