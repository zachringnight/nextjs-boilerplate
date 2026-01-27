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
    description: 'Lead asset for partnership announcement. This is where we capture the marquee footage that anchors the entire campaign — cinematic, high-energy, unmistakably NWSL.',
    uses: [
      'Hero video for partnership launch',
      'Social cutdowns (15s, 30s, 60s)',
      'Launch week campaign assets',
      'Seasonal content bank for in-game moments',
    ],
    capture: [
      'Hero walk-in with dramatic lighting',
      'Dynamic action beats (ball work, movement)',
      'Signature celebration recreations',
      'Detail shots: boots, ball, crest, hands',
      'Modular end-caps for flexible editing',
    ],
    tips: [
      'Let athletes bring their energy — don\'t over-direct',
      'Capture both wide and tight simultaneously',
      'Get at least 3 clean takes per setup',
    ],
  },
  {
    stationNumber: 2,
    station: 'packRip' as const,
    title: 'PACK RIPS',
    subtitle: 'Cards + Category Growth',
    description: 'Real reactions, real collecting energy. This station bridges hobby culture with athlete authenticity — the content that makes collectors feel connected.',
    uses: [
      'Product launch day content',
      'Hobby growth storytelling',
      'Release-day drops + evergreen edits',
      'Sticker album nostalgia bridge',
      'Retail activation support',
    ],
    capture: [
      'Rip reactions (wide + tight angles)',
      'Pull-by-pull commentary',
      'Favorite card hold-up with reaction',
      'Quick collector message to fans',
      'Teammate card reactions',
    ],
    tips: [
      'Let them talk through every card — no silent flips',
      'Capture genuine surprise, not staged reactions',
      'End with "message to collectors" soundbite',
    ],
  },
  {
    stationNumber: 3,
    station: 'social' as const,
    title: 'SOCIAL',
    subtitle: 'Partnership + Seasonal Toolkit',
    description: 'Fast, scalable content for the full season. Vertical-first, quotable, and designed to flood timelines when the moment calls for it.',
    uses: [
      'Partnership storytelling posts',
      'Collecting culture positioning',
      'Tentpole moment coverage',
      'In-season quick-hit content',
      'Reactive soundbite library',
    ],
    capture: [
      'Vertical-first clips (9:16)',
      'One horizontal backup option',
      'Tight, quotable 10-15s answers',
      'Reactive soundbite bank for any moment',
      'Personal stories + childhood memories',
    ],
    soundbites: [
      "We're just getting started.",
      "This league is different.",
      "Big year. Big energy.",
    ],
  },
  {
    stationNumber: 4,
    station: 'vnr' as const,
    title: 'VNR',
    subtitle: 'Broadcast Soundbites + B-Roll',
    description: 'Press-ready assets for any media package. Clean, professional, ready to drop into any broadcast feature or news segment.',
    uses: [
      'Broadcast feature packages',
      'Media kit distribution',
      'League narrative content',
      'Partner delivery assets',
      'Documentary-style storytelling',
    ],
    capture: [
      'Clean soundbites on black/neutral backdrop',
      'B-roll: movement, ball work, detail shots',
      'Walk-ins with confident energy',
      'Thoughtful answers to legacy questions',
    ],
    tips: [
      'Keep backgrounds clean and distraction-free',
      'Capture both formal and casual tones',
      'Get backup takes for key soundbites',
    ],
  },
  {
    stationNumber: 5,
    station: 'signing' as const,
    title: 'SIGNING',
    subtitle: 'Behind-the-Scenes + Authenticity',
    description: 'Collector trust content. This is proof it\'s real — the footage that makes premium products feel premium and connects fans to the actual moment.',
    uses: [
      'Behind-the-scenes hobby content',
      'Authenticity storytelling',
      'Premium product marketing',
      'Autograph certification support',
      'Collector community engagement',
    ],
    capture: [
      'Signing footage: wide setup + tight detail',
      'Pen-to-card close-ups',
      'End-cap holding finished signed card',
      'Casual athlete chat while signing',
      'Stack of completed cards beauty shot',
    ],
    tips: [
      'Capture the full signing motion, not just the result',
      'Get natural athlete commentary during signing',
      'Wide shot should show the professional setup',
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
    `${player.name}`,
    `${player.name} — Questions`,
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
      // Don't navigate if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(0, prev - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlide(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlide(totalSlides - 1);
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
