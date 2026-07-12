"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const CLIPS = [
  { id: "clip-1", label: "Clip 1", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=0c851955-e04a-48cb-aabd-9bd803ba90de&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-2", label: "Clip 2", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=41820d49-dcfe-422b-9a82-e08e246e8eca&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-3", label: "Clip 3", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=45739d48-11bf-47b8-a18e-0f3849a6c06c&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-4", label: "Clip 4", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=1ecbc356-4c24-4ed8-8f1d-d9d0cb08841c&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-5", label: "Clip 5", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=de0362e6-6e0c-4aa7-978d-bc918370190c&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-6", label: "Clip 6", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=cf37449b-1474-467c-b839-b9a3edff9681&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-7", label: "Clip 7", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=44e7993e-8d91-4fe0-a411-bae915482e6b&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-8", label: "Clip 8", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=b32641b2-bb06-4dc0-8a36-450c88b06ba6&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-9", label: "Clip 9", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=b32641b2-bb06-4dc0-8a36-450c88b06ba6&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-10", label: "Clip 10", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=287dfd0a-5f1b-4682-ace7-96b83b97809c&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-11", label: "Clip 11", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=53c442aa-bc3a-48fa-bd16-95c8b0446929&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-12", label: "Clip 12", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=1e226e83-7df7-4c1f-a7e0-03630400b50a&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-13", label: "Clip 13", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=0ca38296-6dfc-45ff-a28f-22dac9689389&isRM=false&rawMediaType=TV&end=true" },
  { id: "clip-14", label: "Clip 14", url: "https://iqmediacorp.com/ExternalIframeMedia?mediaID=9f051c63-37e3-4160-987a-32fee7e04447&isRM=false&rawMediaType=TV&end=true" },
];

type Clip = (typeof CLIPS)[number];

export default function SeniorBowlRecap() {
  const [activeClip, setActiveClip] = useState<Clip | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectClip = (clip: Clip) => {
    setActiveClip(clip);
    // Clear any existing timeout before scheduling a new one
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    // Scroll to player on mobile
    scrollTimeoutRef.current = setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#070a0f] text-[#e8e6e3]">
      {/* Header */}
      <header className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-[#0055BF] text-white text-[10px] font-bold tracking-[1.5px] uppercase rounded">
                Panini America
              </span>
              <span className="text-white/30 text-sm">February 1, 2026</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Senior Bowl
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Earned Media Recap &middot; {CLIPS.length} Segments
            </p>
          </div>
          <a
            href="/"
            className="text-sm text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to site
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Player Section */}
        <div ref={playerRef} className="mb-12">
          <AnimatePresence mode="wait">
            {activeClip ? (
              <motion.div
                key={activeClip.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#0055BF] rounded-full animate-pulse" />
                    <h2 className="text-sm font-semibold text-white/70">
                      Now Playing: <span className="text-white">{activeClip.label}</span>
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveClip(null)}
                    className="text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-all"
                  >
                    Close
                  </button>
                </div>
                <div className="relative w-full aspect-video max-w-4xl bg-[#0d1117] rounded-xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/50">
                  <iframe
                    src={activeClip.url}
                    className="absolute inset-0 w-full h-full border-none"
                    allowFullScreen
                    loading="lazy"
                    title={activeClip.label}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full aspect-video max-w-4xl bg-gradient-to-br from-[#0d1117] to-[#111827] rounded-xl overflow-hidden border border-white/[0.06] flex items-center justify-center cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#0055BF] focus:ring-offset-2 focus:ring-offset-[#070a0f]"
                onClick={() => handleSelectClip(CLIPS[0])}
                aria-label="Start playing first clip"
              >
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#0055BF]/20 border border-[#0055BF]/30 flex items-center justify-center group-hover:bg-[#0055BF]/30 transition-colors"
                  >
                    <svg className="w-8 h-8 text-[#0055BF] ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </motion.div>
                  <p className="text-white/50 text-sm">Select a clip below or click to start</p>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Clips Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold text-white/50 tracking-wider uppercase">
              All Segments
            </h3>
            <span className="text-xs text-white/30">
              {CLIPS.length} clips
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {CLIPS.map((clip, i) => (
              <ClipCard
                key={clip.id}
                clip={clip}
                index={i}
                isActive={activeClip?.id === clip.id}
                onSelect={handleSelectClip}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/20">
            Panini America &middot; Senior Bowl Earned Media
          </p>
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

function ClipCard({
  clip,
  index,
  isActive,
  onSelect,
}: {
  clip: Clip;
  index: number;
  isActive: boolean;
  onSelect: (clip: Clip) => void;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.button
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4 }}
      onClick={() => onSelect(clip)}
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 text-left w-full focus:outline-none focus:ring-2 focus:ring-[#0055BF] focus:ring-offset-2 focus:ring-offset-[#070a0f] ${
        isActive
          ? "ring-2 ring-[#0055BF] bg-[#0055BF]/10"
          : "bg-[#0d1117] hover:bg-[#111827] border border-white/[0.06] hover:border-white/[0.12]"
      }`}
      aria-label={`Play ${clip.label}`}
      aria-pressed={isActive}
    >
      {/* Thumbnail placeholder */}
      <div className="relative aspect-video bg-gradient-to-br from-[#111827] to-[#0d1117] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Clip number */}
        <span className="text-5xl font-bold text-white/[0.06] select-none">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              isActive
                ? "bg-[#0055BF] scale-100"
                : "bg-white/10 group-hover:bg-[#0055BF]/80 group-hover:scale-110 scale-90 opacity-0 group-hover:opacity-100"
            }`}
          >
            {isActive ? (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>

        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-[#0055BF] rounded-full"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-[10px] font-semibold text-white">PLAYING</span>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
            {clip.label}
          </p>
          <p className="text-[11px] text-white/30 mt-0.5">
            Segment {index + 1} of {CLIPS.length}
          </p>
        </div>
        <span className="text-[10px] font-semibold text-white/20 bg-white/[0.04] px-2 py-1 rounded tracking-wider">
          TV
        </span>
      </div>
    </motion.button>
  );
}
