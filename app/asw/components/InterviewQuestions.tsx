'use client';

import { tunnelInterviewQuestions } from '../data/players';
import { STATION_CONFIG } from '../lib/constants';

interface InterviewQuestionsProps {
  largeText?: boolean;
}

const categories = [
  {
    key: 'partnership' as const,
    color: 'bg-green-500',
    textColor: 'text-white',
  },
  {
    key: 'adVO' as const,
    color: 'bg-amber-500',
    textColor: 'text-black',
  },
  {
    key: 'hybrid' as const,
    color: 'bg-blue-500',
    textColor: 'text-white',
  },
];

export default function InterviewQuestions({ largeText = false }: InterviewQuestionsProps) {
  return (
    <div>
      <div className="mb-4">
        <h4 className={`text-sm font-bold ${STATION_CONFIG.tunnel.textClass} flex items-center gap-2`}>
          <span className={`w-6 h-6 ${STATION_CONFIG.tunnel.bgClass} rounded flex items-center justify-center text-white text-xs`}>
            {STATION_CONFIG.tunnel.emoji}
          </span>
          TUNNEL INTERVIEW QUESTIONS
        </h4>
        <p className="text-xs text-gray-500 ml-8">Partnership + Ad VO prompts</p>
      </div>

      {categories.map(({ key, color, textColor }) => (
        <div key={key} className="mb-4 last:mb-0">
          <h5 className="text-xs font-semibold text-gray-400 mb-2">
            {tunnelInterviewQuestions[key].title}
          </h5>
          <ul className={largeText ? 'space-y-4' : 'space-y-3'}>
            {tunnelInterviewQuestions[key].questions.map((question, index) => (
              <li key={index} className="flex items-start gap-3">
                <span
                  className={`${largeText ? 'w-7 h-7 text-sm' : 'w-6 h-6 text-xs'} ${color} rounded-lg flex items-center justify-center font-bold ${textColor} flex-shrink-0`}
                >
                  {index + 1}
                </span>
                <span className={`text-gray-100 leading-relaxed ${largeText ? 'text-lg' : 'text-base'}`}>
                  {question}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
