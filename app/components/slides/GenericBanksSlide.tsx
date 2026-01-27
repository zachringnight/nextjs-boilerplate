import { genericBanks } from '../../data/players';

export default function GenericBanksSlide() {
  const banks = [
    {
      ...genericBanks.worldCupSticker,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500',
      borderColor: 'border-amber-500/30',
      icon: '🏆',
      description: 'Nostalgia + global collecting culture',
    },
    {
      ...genericBanks.tradingCard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-500/30',
      icon: '🃏',
      description: 'Hobby-specific + collector mindset',
    },
    {
      ...genericBanks.packRipReactions,
      color: 'text-green-400',
      bgColor: 'bg-green-500',
      borderColor: 'border-green-500/30',
      icon: '📦',
      description: 'Live reactions + authentic moments',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 md:px-12 py-12 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-sm tracking-[0.2em] text-gray-500 font-semibold mb-2">
          BACKUP CONTENT
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">GENERIC BANKS</h1>
        <p className="text-gray-500 max-w-xl">
          Use anywhere. Always approval-safe, hype-only, collecting culture questions.
          Perfect for quick pivots or supplementary content.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {banks.map((bank, index) => (
          <div
            key={index}
            className={`bg-[#141414] border ${bank.borderColor} rounded-xl overflow-hidden hover:border-opacity-60 transition-colors`}
          >
            {/* Header */}
            <div className={`${bank.bgColor} bg-opacity-10 px-5 py-4 border-b border-[#2a2a2a]`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{bank.icon}</span>
                <h2 className={`font-bold text-sm tracking-wide ${bank.color}`}>
                  {bank.title}
                </h2>
              </div>
              <p className="text-xs text-gray-500">{bank.description}</p>
            </div>

            {/* Questions */}
            <div className="p-5">
              <ul className="space-y-3">
                {bank.questions.map((question, qIndex) => (
                  <li key={qIndex} className="flex items-start gap-3">
                    <span className={`w-5 h-5 ${bank.bgColor} bg-opacity-20 rounded flex items-center justify-center text-xs font-semibold ${bank.color} flex-shrink-0 mt-0.5`}>
                      {qIndex + 1}
                    </span>
                    <span className="text-sm text-gray-300 leading-relaxed">{question}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Usage tip */}
      <div className="mt-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
        <div className="flex items-start gap-4">
          <span className="text-xl">💡</span>
          <div>
            <h3 className="font-semibold text-sm text-gray-300 mb-1">WHEN TO USE</h3>
            <p className="text-sm text-gray-500">
              Pull from these banks when an athlete needs a breather, when custom questions don&apos;t land,
              or to fill time between stations. All questions are pre-approved and collecting-culture focused.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
