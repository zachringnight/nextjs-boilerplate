interface StationIconProps {
  station: 'field' | 'packRip' | 'social' | 'vnr' | 'signing';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const stationConfig = {
  field: {
    icon: '⬢',
    label: 'FIELD',
    color: 'bg-green-500',
    textColor: 'text-green-500',
  },
  packRip: {
    icon: '▣',
    label: 'PACK RIPS',
    color: 'bg-amber-500',
    textColor: 'text-amber-500',
  },
  social: {
    icon: '◎',
    label: 'SOCIAL',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
  },
  vnr: {
    icon: '◉',
    label: 'VNR',
    color: 'bg-violet-500',
    textColor: 'text-violet-500',
  },
  signing: {
    icon: '✎',
    label: 'SIGNING',
    color: 'bg-pink-500',
    textColor: 'text-pink-500',
  },
};

const sizeClasses = {
  sm: 'w-6 h-6 text-sm',
  md: 'w-8 h-8 text-base',
  lg: 'w-10 h-10 text-lg',
};

export default function StationIcon({ station, size = 'md', showLabel = false }: StationIconProps) {
  const config = stationConfig[station];

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${config.color} ${sizeClasses[size]} rounded-md flex items-center justify-center text-white font-bold`}
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
    <div className="flex gap-6 items-center justify-center">
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

export { stationConfig };
