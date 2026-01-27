import { StationBar } from '../StationIcon';

export default function TitleSlide() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 text-center relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-blue-500/5 pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] mb-6">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-xs tracking-[0.2em] text-gray-400 font-medium">
              OFFICIAL PARTNERSHIP
            </span>
          </div>
          <p className="text-lg md:text-xl tracking-[0.25em] text-amber-400 font-semibold">
            PANINI × NWSL × NWSLPA
          </p>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tight">
          MEDIA DAY
        </h1>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-400 mb-8 tracking-tight">
          2026
        </h2>

        <div className="max-w-xl mx-auto mb-12">
          <p className="text-lg md:text-xl text-gray-300 mb-2 font-medium">
            Shoot Packet: Stations + Content Strategy
          </p>
          <p className="text-sm text-gray-500">
            11 athletes • 5 stations • 1 vision
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-gray-400 mb-16">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">📅</span>
            <span className="font-medium">Tuesday, January 28, 2026</span>
          </div>
          <span className="hidden md:inline text-gray-600">•</span>
          <div className="flex items-center gap-2">
            <span className="text-amber-400">📍</span>
            <span className="font-medium">MG Studio, Los Angeles</span>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs tracking-[0.15em] text-gray-600 mb-4 uppercase">
            Content Stations
          </p>
          <StationBar />
        </div>

        <div className="mt-12 text-xs text-gray-600">
          <p>Press <span className="px-2 py-1 bg-[#1a1a1a] rounded border border-[#2a2a2a] font-mono">→</span> to navigate</p>
        </div>
      </div>
    </div>
  );
}
