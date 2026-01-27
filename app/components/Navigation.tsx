'use client';

import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  currentSlide: number;
  totalSlides: number;
  onNavigate: (slide: number) => void;
  slideLabels: string[];
}

export default function Navigation({
  currentSlide,
  totalSlides,
  onNavigate,
  slideLabels,
}: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-[#2a2a2a] px-4 py-3 flex items-center justify-between z-50 no-print">
        <button
          onClick={() => onNavigate(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="p-2 rounded-lg hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-400 font-mono">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>

        <button
          onClick={() => onNavigate(Math.min(totalSlides - 1, currentSlide + 1))}
          disabled={currentSlide === totalSlides - 1}
          className="p-2 rounded-lg hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </nav>

      {/* Slide menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] no-print">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#141414] border-l border-[#2a2a2a] overflow-y-auto">
            <div className="sticky top-0 bg-[#141414] border-b border-[#2a2a2a] p-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg">Slides</h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2">
              {slideLabels.map((label, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onNavigate(index);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                    currentSlide === index
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'hover:bg-[#2a2a2a] text-gray-300'
                  }`}
                >
                  <span className="text-xs text-gray-500 font-mono mr-2">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
