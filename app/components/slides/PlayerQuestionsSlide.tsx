import type { Player } from '../../data/players';
import { stationConfig } from '../StationIcon';

interface PlayerQuestionsSlideProps {
  player: Player;
}

const stationOrder: Array<'field' | 'social' | 'vnr' | 'packRip'> = ['field', 'social', 'vnr', 'packRip'];

export default function PlayerQuestionsSlide({ player }: PlayerQuestionsSlideProps) {
  return (
    <div className="min-h-screen flex flex-col justify-start px-8 md:px-16 py-12 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 tracking-tight">{player.name}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {stationOrder.map((stationKey) => {
          const stationData = player.questions.find((q) => q.station === stationKey);
          if (!stationData) return null;

          const config = stationConfig[stationKey];
          const displayName = stationKey === 'packRip' ? 'PACK RIP' : stationKey.toUpperCase();

          return (
            <div
              key={stationKey}
              className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-lg ${config.textColor}`}>{config.icon}</span>
                <h2 className={`font-semibold text-sm tracking-wide ${config.textColor}`}>
                  {displayName}
                </h2>
              </div>
              <ul className="space-y-3">
                {stationData.questions.map((question, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="w-1 h-1 bg-gray-600 rounded-full mt-2 flex-shrink-0" />
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
