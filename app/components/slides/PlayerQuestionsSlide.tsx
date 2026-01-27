import type { Player } from '../../data/players';
import { stationConfig } from '../StationIcon';

interface PlayerQuestionsSlideProps {
  player: Player;
}

const stationOrder: Array<'field' | 'social' | 'vnr' | 'packRip'> = ['field', 'social', 'vnr', 'packRip'];

export default function PlayerQuestionsSlide({ player }: PlayerQuestionsSlideProps) {
  return (
    <div className="min-h-screen flex flex-col justify-start px-6 md:px-12 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-[#2a2a2a] pb-4">
        <div>
          <p className="text-xs tracking-[0.15em] text-gray-500 font-semibold mb-1">
            INTERVIEW QUESTIONS
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{player.name}</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">GROUP {player.group}</p>
          <p className="text-sm text-gray-400">{player.groupTime}</p>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {stationOrder.map((stationKey) => {
          const stationData = player.questions.find((q) => q.station === stationKey);
          if (!stationData) return null;

          const config = stationConfig[stationKey];
          const displayName = stationKey === 'packRip' ? 'PACK RIP' : stationKey.toUpperCase();

          return (
            <div
              key={stationKey}
              className={`bg-[#141414] border ${config.borderColor} rounded-xl p-5 hover:border-opacity-60 transition-colors`}
            >
              {/* Station header */}
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#2a2a2a]">
                <div className={`w-8 h-8 ${config.bgColor} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                  {config.icon}
                </div>
                <div>
                  <h2 className={`font-semibold text-sm tracking-wide ${config.textColor}`}>
                    {displayName}
                  </h2>
                  <p className="text-xs text-gray-500">{stationData.questions.length} questions</p>
                </div>
              </div>

              {/* Questions list */}
              <ul className="space-y-3">
                {stationData.questions.map((question, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className={`w-5 h-5 ${config.bgColor} bg-opacity-20 rounded flex items-center justify-center text-xs font-semibold ${config.textColor} flex-shrink-0 mt-0.5`}>
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-300 leading-relaxed">{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Footer tip */}
      <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
        <p className="text-xs text-gray-500 text-center">
          Questions flex by athlete comfort • Use generic banks as backup
        </p>
      </div>
    </div>
  );
}
