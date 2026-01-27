import { StationBar } from '../StationIcon';

export default function TitleSlide() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="mb-8">
        <p className="text-sm tracking-[0.3em] text-gray-400 font-semibold mb-4">
          PANINI × NWSL × NWSLPA
        </p>
      </div>

      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
        NWSL MEDIA DAY 2026
      </h1>

      <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl">
        SHOOT PACKET: STATIONS + CONTENT STRATEGY
      </p>

      <div className="text-gray-400 mb-16">
        <p className="text-lg">Tuesday, January 28, 2026</p>
        <p className="text-lg">MG Studio, Los Angeles</p>
      </div>

      <StationBar />
    </div>
  );
}
