import { StationBar } from '../StationIcon';

export default function ClosingSlide() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="max-w-4xl mx-auto mb-16">
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-8 mb-12">
          <h2 className="text-amber-400 font-semibold text-sm tracking-wide mb-4">NOTES</h2>
          <ul className="text-gray-300 space-y-3 text-left max-w-xl mx-auto">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0" />
              Prompts flex by athlete comfort + NWSL/NWSLPA guidance
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0" />
              Content shared for co-promotion where it makes sense
            </li>
          </ul>
        </div>

        <div className="space-y-4 mb-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Make NWSL athletes look incredible.
          </h1>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-amber-400">
            Build pride. Build collectors.
          </h1>
        </div>

        <StationBar />
      </div>
    </div>
  );
}
