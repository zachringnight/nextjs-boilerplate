import { StationBar } from '../StationIcon';

export default function OverviewSlide() {
  return (
    <div className="min-h-screen flex flex-col justify-center px-8 md:px-16 py-16 max-w-6xl mx-auto">
      <div className="mb-12">
        <p className="text-sm tracking-[0.2em] text-gray-500 font-semibold mb-2">
          THE VISION
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">OVERVIEW</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 hover:border-amber-500/30 transition-colors">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-4">
            <span className="text-amber-400 text-xl">🎯</span>
          </div>
          <h2 className="text-amber-400 font-semibold text-sm tracking-wide mb-3">PURPOSE</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Launch partnership content + build a year-round athlete content engine.
          </p>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Announce Panini × NWSL partnership</li>
            <li>• Create evergreen content library</li>
            <li>• Support full 2026 season</li>
          </ul>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 hover:border-blue-500/30 transition-colors">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
            <span className="text-blue-400 text-xl">🎬</span>
          </div>
          <h2 className="text-blue-400 font-semibold text-sm tracking-wide mb-3">FOCUS</h2>
          <ul className="text-gray-300 space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <span className="font-medium">Partnership storytelling</span>
                <p className="text-sm text-gray-500">Hero moments for launch week</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <span className="font-medium">Athlete-first narratives</span>
                <p className="text-sm text-gray-500">Authentic voices, real stories</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <div>
                <span className="font-medium">Collecting culture</span>
                <p className="text-sm text-gray-500">Category growth + hobby engagement</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 hover:border-green-500/30 transition-colors">
          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
            <span className="text-green-400 text-xl">📱</span>
          </div>
          <h2 className="text-green-400 font-semibold text-sm tracking-wide mb-3">FORMAT</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Video-first content for every platform.
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-[#1a1a1a] rounded-lg px-3 py-2 text-gray-400 text-center">Social</div>
            <div className="bg-[#1a1a1a] rounded-lg px-3 py-2 text-gray-400 text-center">Broadcast</div>
            <div className="bg-[#1a1a1a] rounded-lg px-3 py-2 text-gray-400 text-center">Retail</div>
            <div className="bg-[#1a1a1a] rounded-lg px-3 py-2 text-gray-400 text-center">Hobby</div>
          </div>
        </div>
      </div>

      {/* Day-of snapshot */}
      <div className="bg-gradient-to-r from-amber-500/10 via-[#141414] to-blue-500/10 border border-[#2a2a2a] rounded-xl p-6 mb-12">
        <h2 className="text-sm tracking-[0.15em] text-gray-500 font-semibold mb-4">DAY-OF SNAPSHOT</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-white">11</p>
            <p className="text-sm text-gray-500">Athletes</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">5</p>
            <p className="text-sm text-gray-500">Stations</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">3</p>
            <p className="text-sm text-gray-500">Groups</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">20</p>
            <p className="text-sm text-gray-500">Min/Station</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2a2a2a] pt-8">
        <p className="text-xs tracking-[0.15em] text-gray-600 mb-4 uppercase text-center">
          Content Stations
        </p>
        <StationBar />
      </div>
    </div>
  );
}
