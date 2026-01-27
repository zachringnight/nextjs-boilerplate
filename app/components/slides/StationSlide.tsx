import StationIcon, { stationConfig } from '../StationIcon';

interface StationSlideProps {
  stationNumber: number;
  station: 'field' | 'packRip' | 'social' | 'vnr' | 'signing';
  title: string;
  subtitle: string;
  description: string;
  uses: string[];
  capture: string[];
  soundbites?: string[];
  tips?: string[];
  duration?: string;
}

export default function StationSlide({
  stationNumber,
  station,
  title,
  subtitle,
  description,
  uses,
  capture,
  soundbites,
  tips,
  duration = '20 min/player',
}: StationSlideProps) {
  const config = stationConfig[station];

  return (
    <div className="min-h-screen flex flex-col justify-center px-8 md:px-16 py-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm tracking-[0.2em] text-gray-500 font-semibold">
            STATION {stationNumber}
          </span>
          <span className="text-gray-600">•</span>
          <span className="text-sm text-gray-500">{duration}</span>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <StationIcon station={station} size="lg" />
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
          </div>
        </div>
        <p className={`text-xl font-medium ${config.textColor}`}>{subtitle}</p>
        <p className="text-gray-500 mt-2 max-w-2xl">{description}</p>
      </div>

      {/* Content Grid */}
      <div className={`grid ${soundbites || tips ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-8`}>
        {/* Uses */}
        <div className={`bg-[#141414] border ${config.borderColor} rounded-xl p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📦</span>
            <h2 className={`font-semibold text-sm tracking-wide ${config.textColor}`}>USES</h2>
          </div>
          <ul className="text-gray-300 space-y-3">
            {uses.map((use, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className={`w-1.5 h-1.5 ${config.bgColor} rounded-full mt-2 flex-shrink-0`} />
                <span>{use}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Capture */}
        <div className={`bg-[#141414] border ${config.borderColor} rounded-xl p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎬</span>
            <h2 className={`font-semibold text-sm tracking-wide ${config.textColor}`}>CAPTURE</h2>
          </div>
          <ul className="text-gray-300 space-y-3">
            {capture.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className={`w-1.5 h-1.5 ${config.bgColor} rounded-full mt-2 flex-shrink-0`} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Soundbites OR Tips */}
        {soundbites && (
          <div className={`bg-[#141414] border ${config.borderColor} rounded-xl p-6`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💬</span>
              <h2 className={`font-semibold text-sm tracking-wide ${config.textColor}`}>SOUNDBITES</h2>
            </div>
            <ul className="text-gray-300 space-y-4">
              {soundbites.map((bite, index) => (
                <li key={index} className="italic text-gray-400 border-l-2 border-gray-700 pl-3">
                  &ldquo;{bite}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        )}

        {tips && !soundbites && (
          <div className={`bg-[#141414] border ${config.borderColor} rounded-xl p-6`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💡</span>
              <h2 className={`font-semibold text-sm tracking-wide ${config.textColor}`}>PRO TIPS</h2>
            </div>
            <ul className="text-gray-300 space-y-3">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className={`w-1.5 h-1.5 ${config.bgColor} rounded-full mt-2 flex-shrink-0`} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Station indicator bar */}
      <div className="flex justify-center gap-2 mt-auto pt-8">
        {[1, 2, 3, 4, 5].map((num) => (
          <div
            key={num}
            className={`h-1.5 rounded-full transition-all ${
              num === stationNumber
                ? `w-8 ${config.bgColor}`
                : 'w-4 bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
