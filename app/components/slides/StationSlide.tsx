import StationIcon from '../StationIcon';

interface StationSlideProps {
  stationNumber: number;
  station: 'field' | 'packRip' | 'social' | 'vnr' | 'signing';
  title: string;
  subtitle: string;
  description: string;
  uses: string[];
  capture: string[];
  soundbites?: string[];
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
}: StationSlideProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center px-8 md:px-16 py-16 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-sm tracking-[0.2em] text-gray-500 font-semibold mb-4">
          STATION {stationNumber}
        </p>
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
          <StationIcon station={station} size="lg" />
        </div>
        <p className="text-xl text-gray-400">{subtitle}</p>
        <p className="text-gray-500 mt-2">{description}</p>
      </div>

      <div className={`grid ${soundbites ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-amber-400 font-semibold text-sm tracking-wide mb-4">USES</h2>
          <ul className="text-gray-300 space-y-2">
            {uses.map((use, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0" />
                {use}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-amber-400 font-semibold text-sm tracking-wide mb-4">CAPTURE</h2>
          <ul className="text-gray-300 space-y-2">
            {capture.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {soundbites && (
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
            <h2 className="text-amber-400 font-semibold text-sm tracking-wide mb-4">SOUNDBITES</h2>
            <ul className="text-gray-300 space-y-3">
              {soundbites.map((bite, index) => (
                <li key={index} className="italic text-gray-400">
                  &ldquo;{bite}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
