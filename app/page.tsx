'use client';

import { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation';
import TitleSlide from './components/slides/TitleSlide';
import OverviewSlide from './components/slides/OverviewSlide';
import StationSlide from './components/slides/StationSlide';
import ClosingSlide from './components/slides/ClosingSlide';
import RotationSlide from './components/slides/RotationSlide';
import PlayerDividerSlide from './components/slides/PlayerDividerSlide';
import PlayerQuestionsSlide from './components/slides/PlayerQuestionsSlide';
import GenericBanksSlide from './components/slides/GenericBanksSlide';
import { players } from './data/players';

const stationData = [
  {
    stationNumber: 1,
    station: 'field' as const,
    title: 'FIELD',
    subtitle: 'Hero Video + Rollout Content',
    description: 'Lead asset for partnership announcement.',
    uses: [
      'Hero video + cutdowns',
      'Launch week hype',
      'Campaign rollout',
      'Seasonal content bank',
    ],
    capture: [
      'Hero walk-in',
      'Quick action beat',
      'Celebration moment',
      'Detail shots (boots, ball, crest)',
      'Modular end-caps',
    ],
  },
  {
    stationNumber: 2,
    station: 'packRip' as const,
    title: 'PACK RIPS',
    subtitle: 'Cards + Category Growth',
    description: 'Real reactions, real collecting energy.',
    uses: [
      'Product launch content',
      'Hobby growth storytelling',
      'Release-day + evergreen edits',
      'Sticker album nostalgia bridge',
    ],
    capture: [
      'Rip reactions (wide + tight)',
      'Pull-by-pull comments',
      'Favorite card hold-up',
      'Quick collector message',
    ],
  },
  {
    stationNumber: 3,
    station: 'social' as const,
    title: 'SOCIAL',
    subtitle: 'Partnership + Seasonal Toolkit',
    description: 'Fast, scalable content for the full season.',
    uses: [
      'Partnership storytelling',
      'Collecting culture positioning',
      'Tentpole moments',
      'In-season quick hits',
    ],
    capture: [
      'Vertical-first clips',
      'One horizontal option',
      'Tight, quotable answers',
      'Reactive soundbite bank',
    ],
    soundbites: [
      "We're just getting started",
      'This league is different',
      'Big year. Big energy',
    ],
  },
  {
    stationNumber: 4,
    station: 'vnr' as const,
    title: 'VNR',
    subtitle: 'Broadcast Soundbites + B-Roll',
    description: 'Press-ready assets for any media package.',
    uses: [
      'Broadcast features + reels',
      'Media kit distribution',
      'League narrative content',
      'Partner delivery',
    ],
    capture: ['Clean soundbites', 'B-roll movement + details', 'Walk-ins, ball work'],
  },
  {
    stationNumber: 5,
    station: 'signing' as const,
    title: 'SIGNING',
    subtitle: 'Behind-the-Scenes + Authenticity',
    description: "Collector trust content. Proof it's real.",
    uses: ['BTS hobby content', 'Authenticity storytelling', 'Premium product marketing'],
    capture: [
      'Signing footage (wide + detail)',
      'Pen-to-card moments',
      'End-cap holding finished card',
    ],
  },
];

// Build slide labels for navigation
const slideLabels = [
  'Title',
  'Overview',
  'Station 1: Field',
  'Station 2: Pack Rips',
  'Station 3: Social',
  'Station 4: VNR',
  'Station 5: Signing',
  'Closing',
  'Rotation Schedule',
  ...players.flatMap((player) => [
    `${player.name} (Divider)`,
    `${player.name} (Questions)`,
  ]),
  'Generic Banks',
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = slideLabels.length;

  const handleNavigate = useCallback((slide: number) => {
    setCurrentSlide(slide);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(0, prev - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides]);

  const renderSlide = () => {
    // Slide 0: Title
    if (currentSlide === 0) {
      return <TitleSlide />;
    }
    // Slide 1: Overview
    if (currentSlide === 1) {
      return <OverviewSlide />;
    }
    // Slides 2-6: Stations
    if (currentSlide >= 2 && currentSlide <= 6) {
      const stationIndex = currentSlide - 2;
      return <StationSlide {...stationData[stationIndex]} />;
    }
    // Slide 7: Closing
    if (currentSlide === 7) {
      return <ClosingSlide />;
    }
    // Slide 8: Rotation Schedule
    if (currentSlide === 8) {
      return <RotationSlide />;
    }
    // Slides 9-30: Player Dividers and Questions (11 players x 2 slides each)
    if (currentSlide >= 9 && currentSlide <= 30) {
      const playerIndex = Math.floor((currentSlide - 9) / 2);
      const isQuestionSlide = (currentSlide - 9) % 2 === 1;
      const player = players[playerIndex];

      if (isQuestionSlide) {
        return <PlayerQuestionsSlide player={player} />;
      } else {
        return (
          <PlayerDividerSlide
            playerNumber={player.playerNumber}
            totalPlayers={11}
            group={player.group}
            groupTime={player.groupTime}
            name={player.name}
            subtitle={player.subtitle}
          />
        );
      }
    }
    // Slide 31: Generic Banks
    if (currentSlide === 31) {
      return <GenericBanksSlide />;
    }

    return <TitleSlide />;
  };

  return (
    <main className="pb-20">
      <div className="slide">{renderSlide()}</div>
      <Navigation
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        onNavigate={handleNavigate}
        slideLabels={slideLabels}
      />
    </main>
  );
}
