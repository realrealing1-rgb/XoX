import React from 'react';
import { GameId, Player } from '../game/types';

export function SymbolMark({
  symbol,
  size = 'md',
  isFading = false,
}: {
  symbol: Player | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isFading?: boolean;
}) {
  const dim =
    size === 'xs'
      ? 'w-4 h-4'
      : size === 'sm'
      ? 'w-6 h-6'
      : size === 'lg'
      ? 'w-12 h-12'
      : 'w-8 h-8';

  if (symbol === 'X') {
    return (
      <svg
        viewBox="0 0 36 36"
        className={`${dim} ${isFading ? 'animate-fading-piece opacity-60' : 'animate-piece'}`}
        aria-hidden="true"
      >
        <path
          d="M8 8L28 28M28 8L8 28"
          stroke="#0f0c09"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M8 8L28 28M28 8L8 28"
          stroke="#e89b3c"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {isFading && (
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            stroke="#e89b3c"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        )}
      </svg>
    );
  }

  if (symbol === 'O') {
    return (
      <svg
        viewBox="0 0 36 36"
        className={`${dim} ${isFading ? 'animate-fading-piece opacity-60' : 'animate-piece'}`}
        aria-hidden="true"
      >
        <circle
          cx="18"
          cy="18"
          r="10.5"
          fill="none"
          stroke="#0f0c09"
          strokeWidth="7"
        />
        <circle
          cx="18"
          cy="18"
          r="10.5"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="4.5"
        />
        {isFading && (
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        )}
      </svg>
    );
  }

  return null;
}

export function GameEmblemIcon({ gameId, className = 'w-6 h-6' }: { gameId: GameId; className?: string }) {
  switch (gameId) {
    case 'classic-xox':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" strokeOpacity="0.45" />
          <path d="M4.5 4.5l3 3m0-3l-3 3" stroke="#e89b3c" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2" stroke="#38bdf8" />
          <path d="M16.5 16.5l3 3m0-3l-3 3" stroke="#e89b3c" strokeLinecap="round" />
        </svg>
      );
    case 'infinite-xox':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path
            d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"
            stroke="#e89b3c"
          />
        </svg>
      );
    case 'ultimate-xox':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeOpacity="0.6" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
          <rect x="9.5" y="9.5" width="5" height="5" fill="#e89b3c" fillOpacity="0.35" stroke="#e89b3c" />
        </svg>
      );
    case 'gobblet-xox':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" stroke="#e89b3c" />
          <circle cx="12" cy="12" r="5.5" stroke="#38bdf8" strokeDasharray="2 2" />
          <circle cx="12" cy="12" r="2" fill="#e89b3c" />
        </svg>
      );
    case 'numeric-xox':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="3" strokeOpacity="0.5" />
          <text x="12" y="16" textAnchor="middle" fill="#e89b3c" fontSize="11" fontWeight="bold" stroke="none">
            15
          </text>
        </svg>
      );
    case 'tapatan-xox':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="4" y="4" width="16" height="16" strokeOpacity="0.5" />
          <path d="M4 4l16 16M20 4L4 20M12 4v16M4 12h16" strokeOpacity="0.4" />
          <circle cx="12" cy="12" r="2.8" fill="#e89b3c" />
          <circle cx="4" cy="4" r="2.4" fill="#38bdf8" />
          <circle cx="20" cy="12" r="2.4" fill="#e89b3c" />
        </svg>
      );
    case 'misere-xox':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3l9 16H3L12 3z" stroke="#f43f5e" />
          <path d="M12 9v4M12 16h.01" stroke="#f5efe6" strokeLinecap="round" />
        </svg>
      );
    case 'connect4-xox':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" strokeOpacity="0.5" />
          <circle cx="8" cy="16" r="2" fill="#e89b3c" stroke="none" />
          <circle cx="12" cy="16" r="2" fill="#38bdf8" stroke="none" />
          <circle cx="12" cy="11.5" r="2" fill="#e89b3c" stroke="none" />
          <path d="M12 2v4m-2-2l2 2 2-2" stroke="#e89b3c" strokeLinecap="round" />
        </svg>
      );
    case 'obstacle-xox':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 3 20 8 18 19 6 19 4 8" stroke="#a8a29e" fill="#44403c" fillOpacity="0.5" />
          <path d="M9 10l6 6m0-6l-6 6" stroke="#e89b3c" strokeLinecap="round" />
        </svg>
      );
    case 'gomoku-xox':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 8h16M4 12h16M4 16h16M8 4v16M12 4v16M16 4v16" strokeOpacity="0.4" />
          <circle cx="6" cy="6" r="2" fill="#e89b3c" stroke="none" />
          <circle cx="10" cy="10" r="2" fill="#e89b3c" stroke="none" />
          <circle cx="14" cy="14" r="2" fill="#e89b3c" stroke="none" />
          <circle cx="18" cy="18" r="2" fill="#e89b3c" stroke="none" />
        </svg>
      );
    case 'sos-xox':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="20" height="14" rx="2" strokeOpacity="0.5" />
          <text x="12" y="15" textAnchor="middle" fill="#38bdf8" fontSize="9.5" fontWeight="bold" stroke="none">
            SOS
          </text>
        </svg>
      );
    case 'dots-boxes':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="5" width="14" height="14" stroke="#e89b3c" />
          <circle cx="5" cy="5" r="2.2" fill="#f5efe6" stroke="none" />
          <circle cx="19" cy="5" r="2.2" fill="#f5efe6" stroke="none" />
          <circle cx="5" cy="19" r="2.2" fill="#f5efe6" stroke="none" />
          <circle cx="19" cy="19" r="2.2" fill="#f5efe6" stroke="none" />
        </svg>
      );
    case 'reversi-xox':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="8.5" cy="8.5" r="4" fill="#e89b3c" stroke="none" />
          <circle cx="15.5" cy="15.5" r="4" fill="#e89b3c" stroke="none" />
          <circle cx="15.5" cy="8.5" r="4" fill="#38bdf8" stroke="none" />
          <circle cx="8.5" cy="15.5" r="4" fill="#38bdf8" stroke="none" />
        </svg>
      );
  }
}

export function TahtaTitleEmblem() {
  return (
    <div className="flex items-center gap-3.5 select-none">
      <svg
        viewBox="0 0 56 56"
        className="w-12 h-12 shrink-0"
        role="img"
        aria-label="Tahta Amblemi"
      >
        <rect
          x="3"
          y="3"
          width="50"
          height="50"
          rx="11"
          fill="#261e17"
          stroke="#d4a359"
          strokeWidth="2.5"
        />
        <path
          d="M20 9v38M36 9v38M9 20h38M9 36h38"
          stroke="#d4a359"
          strokeOpacity="0.35"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Top-left X */}
        <path
          d="M11.5 11.5l6 6m0-6l-6 6"
          stroke="#e89b3c"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* Center O */}
        <circle
          cx="28"
          cy="28"
          r="4.2"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.8"
        />
        {/* Bottom-right X */}
        <path
          d="M41.5 41.5l6 6m0-6l-6 6"
          stroke="#e89b3c"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#f5efe6] leading-none">
          TAHTA
        </h1>
        <p className="text-xs text-[#cbbba6] mt-1">
          13 Taktiksel XoX &amp; Izgara Strateji Koleksiyonu
        </p>
      </div>
    </div>
  );
}
