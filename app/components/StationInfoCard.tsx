import { STATION_CONFIG } from '../lib/constants';

type StationType = keyof typeof STATION_CONFIG;

interface StationInfoCardProps {
  station: StationType;
  compact?: boolean;
}

export default function StationInfoCard({ station, compact = false }: StationInfoCardProps) {
  const config = STATION_CONFIG[station];

  if (compact) {
    return (
      <div className={`bg-[#141414] ${config.borderClass} border rounded-xl p-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${config.bgClass} rounded-lg flex items-center justify-center text-xl`}>
            {config.emoji}
          </div>
          <div>
            <h3 className={`font-bold ${config.textClass}`}>{config.shortName}</h3>
            <p className="text-xs text-gray-500">{config.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#141414] ${config.borderClass} border rounded-xl p-4`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 ${config.bgClass} rounded-lg flex items-center justify-center text-xl`}>
          {config.emoji}
        </div>
        <div>
          <h3 className={`font-bold ${config.textClass}`}>{config.shortName}</h3>
          <p className="text-xs text-gray-500">{config.description}</p>
        </div>
      </div>
    </div>
  );
}

export function StationGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <StationInfoCard station="tunnel" />
      <StationInfoCard station="product" />
    </div>
  );
}
