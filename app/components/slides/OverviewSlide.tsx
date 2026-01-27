import { StationBar } from '../StationIcon';

export default function OverviewSlide() {
  return (
    <div className="min-h-screen flex flex-col justify-center px-8 md:px-16 py-16 max-w-6xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight">OVERVIEW</h1>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-amber-400 font-semibold text-sm tracking-wide mb-3">PURPOSE</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Launch partnership content + build a year-round athlete content engine.
          </p>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-amber-400 font-semibold text-sm tracking-wide mb-3">FOCUS</h2>
          <ul className="text-gray-300 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              Partnership storytelling
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              Athlete-first narratives
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              Collecting culture + category growth
            </li>
          </ul>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-amber-400 font-semibold text-sm tracking-wide mb-3">FORMAT</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Video-first content for social, broadcast, retail, and hobby.
          </p>
        </div>
      </div>

      <div className="border-t border-[#2a2a2a] pt-8">
        <StationBar />
      </div>
    </div>
  );
}
