interface StationIconProps {
  station: 'tunnel' | 'product';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const stationConfig = {
  tunnel: {
    icon: '🚶',
    label: 'TUNNEL',
    color: 'bg-green-500',
    bgColor: 'bg-green-500',
    textColor: 'text-green-500',
    borderColor: 'border-green-500/30',
    description: 'Walk-in/hero footage + interview prompts',
    hasInterview: true,
  },
  product: {
    icon: '📸',
    label: 'PRODUCT',
    color: 'bg-amber-500',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
    description: 'Card photography and poses - visual only',
    hasInterview: false,
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
  const stations: Array<'tunnel' | 'product'> = ['tunnel', 'product'];

  return (
    <div className="flex gap-6 items-center justify-center flex-wrap">
      {stations.map((station) => (
        <StationIcon key={station} station={station} size="sm" showLabel />
      ))}
    </div>
  );
}

export function StationBadge({ station }: { station: 'tunnel' | 'product' }) {
  const config = stationConfig[station];

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color} bg-opacity-20`}>
      <span className="text-lg">{config.icon}</span>
      <span className={`text-sm font-semibold ${config.textColor}`}>{config.label}</span>
    </div>
  );
}
