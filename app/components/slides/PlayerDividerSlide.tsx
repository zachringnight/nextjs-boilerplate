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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 text-center">
      <p className="text-sm tracking-[0.2em] text-gray-500 font-semibold mb-8">
        PLAYER {playerNumber} OF {totalPlayers} | GROUP {group} • {groupTime}
      </p>

      <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">{name}</h1>
      <p className="text-xl text-gray-400 mb-12">{subtitle}</p>

      <div className="flex gap-6">
        {stations.map((station) => (
          <StationIcon key={station} station={station} size="md" showLabel />
        ))}
      </div>
    </div>
  );
}
