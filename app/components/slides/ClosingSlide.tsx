import { StationBar } from '../StationIcon';

export default function ClosingSlide() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 text-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-pink-500/5 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Notes card */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-8 mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-xl">📋</span>
            <h2 className="text-amber-400 font-semibold text-sm tracking-wide">PRODUCTION NOTES</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center text-green-400 text-xs flex-shrink-0">✓</span>
                <div>
                  <p className="text-gray-300 font-medium">Athlete-First Approach</p>
                  <p className="text-sm text-gray-500">Prompts flex by athlete comfort + NWSL/NWSLPA guidance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-500/20 rounded flex items-center justify-center text-green-400 text-xs flex-shrink-0">✓</span>
                <div>
                  <p className="text-gray-300 font-medium">Shared Content</p>
                  <p className="text-sm text-gray-500">Content available for co-promotion where it makes sense</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center text-blue-400 text-xs flex-shrink-0">✓</span>
                <div>
                  <p className="text-gray-300 font-medium">Approval Process</p>
                  <p className="text-sm text-gray-500">All content reviewed before publication</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center text-blue-400 text-xs flex-shrink-0">✓</span>
                <div>
                  <p className="text-gray-300 font-medium">Season-Long Bank</p>
                  <p className="text-sm text-gray-500">Evergreen content for the full 2026 season</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero statement */}
        <div className="mb-12">
          <p className="text-sm tracking-[0.2em] text-gray-500 font-semibold mb-6">THE MISSION</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            Make NWSL athletes
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              look incredible.
            </span>
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-400">
            Build pride. Build collectors.
          </h2>
        </div>

        {/* Taglines */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <p className="text-gray-500 text-xs tracking-wide mb-2">ANNOUNCEMENT</p>
            <p className="text-gray-300 font-medium italic">&ldquo;We&apos;re just getting started.&rdquo;</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <p className="text-gray-500 text-xs tracking-wide mb-2">LEAGUE PRIDE</p>
            <p className="text-gray-300 font-medium italic">&ldquo;This league is different.&rdquo;</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <p className="text-gray-500 text-xs tracking-wide mb-2">ENERGY</p>
            <p className="text-gray-300 font-medium italic">&ldquo;Big year. Big energy.&rdquo;</p>
          </div>
        </div>

        <StationBar />

        <p className="text-xs text-gray-600 mt-8">
          PANINI × NWSL × NWSLPA • Media Day 2026
        </p>
      </div>
    </div>
  );
}
