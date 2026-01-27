import { rotationSchedule } from '../../data/players';

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
}

function ScheduleTable({ group }: ScheduleTableProps) {
  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4 md:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-amber-400">{group.name} — {group.time}</h3>
        <p className="text-sm text-gray-500">{group.players.join(' • ')}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th className="text-left py-2 pr-4 text-gray-500 font-medium">Time</th>
              <th className="text-left py-2 px-2 text-green-500 font-medium">FIELD</th>
              <th className="text-left py-2 px-2 text-blue-500 font-medium">SOCIAL</th>
              <th className="text-left py-2 px-2 text-violet-500 font-medium">VNR</th>
              <th className="text-left py-2 pl-2 text-amber-500 font-medium">PACK RIP</th>
            </tr>
          </thead>
          <tbody>
            {group.schedule.map((row, index) => (
              <tr key={index} className="border-b border-[#2a2a2a] last:border-0">
                <td className="py-2 pr-4 text-gray-400 font-mono text-xs">{row.time}</td>
                <td className="py-2 px-2 text-gray-300">{row.field}</td>
                <td className="py-2 px-2 text-gray-300">{row.social}</td>
                <td className="py-2 px-2 text-gray-300">{row.vnr}</td>
                <td className="py-2 pl-2 text-gray-300">{row.packRip}</td>
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
    <div className="min-h-screen flex flex-col justify-center px-8 md:px-16 py-16 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">ROTATION SCHEDULE</h1>
        <p className="text-gray-500">20-min slots per player per station</p>
      </div>

      <div className="space-y-6">
        <ScheduleTable group={rotationSchedule.group1} />
        <ScheduleTable group={rotationSchedule.group2} />
        <ScheduleTable group={rotationSchedule.group3} />
      </div>
    </div>
  );
}
