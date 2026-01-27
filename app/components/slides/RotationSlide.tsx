import { rotationSchedule } from '../../data/players';
import { stationConfig } from '../StationIcon';

interface ScheduleTableProps {
  group: {
    name: string;
    time: string;
    players: string[];
    schedule: Array<{
      time: string;
      field: string;
      social: string;
      vnr: string;
      packRip: string;
    }>;
  };
  groupNumber: number;
}

const groupColors = {
  1: { border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-400' },
  2: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  3: { border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-400' },
};

function ScheduleTable({ group, groupNumber }: ScheduleTableProps) {
  const colors = groupColors[groupNumber as keyof typeof groupColors] || groupColors[1];

  return (
    <div className={`bg-[#141414] border ${colors.border} rounded-xl p-4 md:p-5`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <span className={`w-8 h-8 ${colors.bg} rounded-lg flex items-center justify-center font-bold ${colors.text}`}>
            {groupNumber}
          </span>
          <div>
            <h3 className={`text-lg font-bold ${colors.text}`}>{group.name}</h3>
            <p className="text-xs text-gray-500">{group.time}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{group.players.length} players</p>
        </div>
      </div>

      {/* Player chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {group.players.map((player) => (
          <span key={player} className="px-3 py-1 bg-[#1a1a1a] rounded-full text-xs text-gray-300 font-medium">
            {player}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th className="text-left py-2 pr-4 text-gray-500 font-medium w-20">Time</th>
              <th className="text-left py-2 px-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 ${stationConfig.field.bgColor} rounded flex items-center justify-center text-white text-xs`}>
                    {stationConfig.field.icon}
                  </span>
                  <span className={stationConfig.field.textColor}>FIELD</span>
                </div>
              </th>
              <th className="text-left py-2 px-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 ${stationConfig.social.bgColor} rounded flex items-center justify-center text-white text-xs`}>
                    {stationConfig.social.icon}
                  </span>
                  <span className={stationConfig.social.textColor}>SOCIAL</span>
                </div>
              </th>
              <th className="text-left py-2 px-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 ${stationConfig.vnr.bgColor} rounded flex items-center justify-center text-white text-xs`}>
                    {stationConfig.vnr.icon}
                  </span>
                  <span className={stationConfig.vnr.textColor}>VNR</span>
                </div>
              </th>
              <th className="text-left py-2 pl-2">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 ${stationConfig.packRip.bgColor} rounded flex items-center justify-center text-white text-xs`}>
                    {stationConfig.packRip.icon}
                  </span>
                  <span className={stationConfig.packRip.textColor}>PACK RIP</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {group.schedule.map((row, index) => (
              <tr key={index} className="border-b border-[#2a2a2a] last:border-0 hover:bg-[#1a1a1a] transition-colors">
                <td className="py-3 pr-4">
                  <span className="px-2 py-1 bg-[#1a1a1a] rounded text-gray-400 font-mono text-xs">
                    {row.time}
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-300 font-medium">
                  {row.field === '-' ? <span className="text-gray-600">-</span> : row.field}
                </td>
                <td className="py-3 px-2 text-gray-300 font-medium">
                  {row.social === '-' ? <span className="text-gray-600">-</span> : row.social}
                </td>
                <td className="py-3 px-2 text-gray-300 font-medium">
                  {row.vnr === '-' ? <span className="text-gray-600">-</span> : row.vnr}
                </td>
                <td className="py-3 pl-2 text-gray-300 font-medium">
                  {row.packRip === '-' ? <span className="text-gray-600">-</span> : row.packRip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function RotationSlide() {
  return (
    <div className="min-h-screen flex flex-col justify-start px-6 md:px-12 py-10 max-w-6xl mx-auto">
      <div className="mb-6">
        <p className="text-sm tracking-[0.2em] text-gray-500 font-semibold mb-2">
          DAY-OF LOGISTICS
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">ROTATION SCHEDULE</h1>
        <div className="flex items-center gap-4 text-gray-500 text-sm">
          <span>20 min per station</span>
          <span className="text-gray-700">•</span>
          <span>4 stations per player</span>
          <span className="text-gray-700">•</span>
          <span>3 groups</span>
        </div>
      </div>

      <div className="space-y-4">
        <ScheduleTable group={rotationSchedule.group1} groupNumber={1} />
        <ScheduleTable group={rotationSchedule.group2} groupNumber={2} />
        <ScheduleTable group={rotationSchedule.group3} groupNumber={3} />
      </div>

      {/* Footer note */}
      <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
        <p className="text-xs text-gray-500 text-center">
          Signing station runs throughout • Athletes rotate through interview stations only
        </p>
      </div>
    </div>
  );
}
