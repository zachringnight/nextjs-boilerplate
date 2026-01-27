interface StationIconProps {
  station: 'field' | 'packRip' | 'social' | 'vnr' | 'signing';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const stationConfig = {
  field: {
    icon: '⬢',
    label: 'FIELD',
    color: 'bg-green-500',
    bgColor: 'bg-green-500',
    textColor: 'text-green-500',
    borderColor: 'border-green-500/30',
    description: 'Hero video + rollout content',
  },
  packRip: {
    icon: '▣',
    label: 'PACK RIPS',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
    description: 'Cards + category growth',
  },
  social: {
    icon: '◎',
    label: 'SOCIAL',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500/30',
    description: 'Partnership + seasonal toolkit',
  },
  vnr: {
    icon: '◉',
    label: 'VNR',
    color: 'bg-violet-500',
    bgColor: 'bg-violet-500',
    textColor: 'text-violet-500',
    borderColor: 'border-violet-500/30',
    description: 'Broadcast soundbites + B-roll',
  },
  signing: {
    icon: '✎',
    label: 'SIGNING',
    color: 'bg-pink-500',
    bgColor: 'bg-pink-500',
    textColor: 'text-pink-500',
    borderColor: 'border-pink-500/30',
    description: 'Behind-the-scenes + authenticity',
  },
};

const sizeClasses = {
  sm: 'w-6 h-6 text-sm',
  md: 'w-8 h-8 text-base',
  lg: 'w-12 h-12 text-xl',
};

export default function StationIcon({ station, size = 'md', showLabel = false }: StationIconProps) {
  const config = stationConfig[station];

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${config.color} ${sizeClasses[size]} rounded-lg flex items-center justify-center text-white font-bold shadow-lg`}
      >
        {config.icon}
      </div>
      {showLabel && (
        <span className={`text-xs font-semibold ${config.textColor} tracking-wide`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

export function StationBar() {
  const stations: Array<'field' | 'packRip' | 'social' | 'vnr' | 'signing'> = [
    'field',
    'packRip',
    'social',
    'vnr',
    'signing',
  ];

  return (
    <div className="flex gap-6 items-center justify-center flex-wrap">
      {stations.map((station) => (
        <StationIcon key={station} station={station} size="sm" showLabel />
      ))}
    </div>
  );
}

export function StationBadge({ station }: { station: 'field' | 'packRip' | 'social' | 'vnr' | 'signing' }) {
  const config = stationConfig[station];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color} bg-opacity-20`}>
      <span className="text-lg">{config.icon}</span>
      <span className={`text-sm font-semibold ${config.textColor}`}>{config.label}</span>
    </div>
  );
}
