import { genericBanks } from '../../data/players';

export default function GenericBanksSlide() {
  const banks = [
    { ...genericBanks.worldCupSticker, color: 'text-amber-400', bgColor: 'border-amber-500/30' },
    { ...genericBanks.tradingCard, color: 'text-blue-400', bgColor: 'border-blue-500/30' },
    { ...genericBanks.packRipReactions, color: 'text-green-400', bgColor: 'border-green-500/30' },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center px-8 md:px-16 py-16 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">PANINI GENERIC BANKS</h1>
        <p className="text-gray-500">
          Use anywhere — always approval-safe, hype-only, collecting culture questions
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {banks.map((bank, index) => (
          <div
            key={index}
            className={`bg-[#141414] border ${bank.bgColor} rounded-xl p-6`}
          >
            <h2 className={`font-semibold text-sm tracking-wide mb-4 ${bank.color}`}>
              {bank.title}
            </h2>
            <ul className="space-y-3">
              {bank.questions.map((question, qIndex) => (
                <li key={qIndex} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="w-1 h-1 bg-gray-600 rounded-full mt-2 flex-shrink-0" />
                  {question}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
