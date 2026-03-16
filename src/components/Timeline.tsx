import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';

interface Props {
  currentYear: number;
  setCurrentYear: (y: number) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
}

const MIN_YEAR = -10000;
const MAX_YEAR = 2025;
const SPEED = 480; // years per second

const TICK_MARKS = [
  { year: -10000, label: '10,000 BCE' },
  { year: -5000, label: '5,000 BCE' },
  { year: -3000, label: '3,000 BCE' },
  { year: -1000, label: '1,000 BCE' },
  { year: 0, label: '1 CE' },
  { year: 1000, label: '1,000 CE' },
  { year: 2000, label: '2,000 CE' },
];

export default function Timeline({
  currentYear,
  setCurrentYear,
  isPlaying,
  setIsPlaying,
}: Props) {
  const animRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const yearRef = useRef(currentYear);
  const animateRef = useRef<FrameRequestCallback | null>(null);

  useLayoutEffect(() => {
    yearRef.current = currentYear;
  });

  const animate = useCallback(
    (timestamp: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = timestamp;
      const delta = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;

      const yearsToAdd = (delta / 1000) * SPEED;
      const next = yearRef.current + yearsToAdd;

      if (next >= MAX_YEAR) {
        setCurrentYear(MAX_YEAR);
        setIsPlaying(false);
        return;
      }

      setCurrentYear(next);
      if (animateRef.current) {
        animRef.current = requestAnimationFrame(animateRef.current);
      }
    },
    [setCurrentYear, setIsPlaying]
  );

  useLayoutEffect(() => {
    animateRef.current = animate;
  });

  useEffect(() => {
    if (isPlaying) {
      lastFrameRef.current = 0;
      animRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, animate]);

  const pct = ((currentYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentYear(Number(e.target.value));
    if (isPlaying) setIsPlaying(false);
  };

  const togglePlay = () => {
    if (currentYear >= MAX_YEAR) {
      setCurrentYear(MIN_YEAR);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="timeline">
      <button className="play-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2l10 6-10 6V2z" />
          </svg>
        )}
      </button>

      <div className="timeline-track">
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={currentYear}
          onChange={handleSliderChange}
          className="timeline-slider"
          style={{
            background: `linear-gradient(to right, #c9a84c 0%, #c9a84c ${pct}%, #1a1c24 ${pct}%, #1a1c24 100%)`,
          }}
        />
        <div className="tick-marks">
          {TICK_MARKS.map((t) => {
            const pos = ((t.year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
            return (
              <span
                key={t.year}
                className="tick"
                style={{ left: `${pos}%` }}
                onClick={() => { setCurrentYear(t.year); setIsPlaying(false); }}
              >
                {t.label}
              </span>
            );
          })}
        </div>
      </div>

      <span className="year-display">{formatYear(Math.round(currentYear))}</span>
    </div>
  );
}

function formatYear(y: number): string {
  if (y < 0) return `${Math.abs(y).toLocaleString()} BCE`;
  if (y === 0) return '1 CE';
  return `${y.toLocaleString()} CE`;
}
