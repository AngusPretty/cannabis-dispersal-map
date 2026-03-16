import { useState, useMemo, useCallback } from 'react';
import MapView from './components/MapView';
import Timeline from './components/Timeline';
import Legend from './components/Legend';
import DetailPanel from './components/DetailPanel';
import { dispersalPoints, dispersalRoutes, WORD_SET_META } from './data/dispersalData';
import type { DispersalPoint, WordSet } from './data/dispersalData';
import 'leaflet/dist/leaflet.css';
import './App.css';

const ALL_WORD_SETS = new Set(Object.keys(WORD_SET_META) as WordSet[]);
const WORD_SET_KEYS = Object.keys(WORD_SET_META) as WordSet[];

// Pre-sort points by dateStart for efficient filtering
const sortedPoints = [...dispersalPoints].sort((a, b) => a.dateStart - b.dateStart);

function App() {
  const [currentYear, setCurrentYear] = useState(-10000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordSets, setActiveWordSets] = useState<Set<WordSet>>(ALL_WORD_SETS);
  const [selectedPoint, setSelectedPoint] = useState<DispersalPoint | null>(null);
  const [legendOpen, setLegendOpen] = useState(true);

  const handleToggleWordSet = useCallback((ws: WordSet) => {
    setActiveWordSets((prev) => {
      const next = new Set(prev);
      if (next.has(ws)) {
        next.delete(ws);
      } else {
        next.add(ws);
      }
      return next;
    });
  }, []);

  // Single pass: compute counts and visible total together
  const { pointCounts, visibleCount } = useMemo(() => {
    const counts = {} as Record<WordSet, number>;
    for (const ws of WORD_SET_KEYS) counts[ws] = 0;
    let visible = 0;

    // sortedPoints is sorted by dateStart, so we can break early
    for (const p of sortedPoints) {
      if (p.dateStart > currentYear) break;
      counts[p.wordSet]++;
      if (activeWordSets.has(p.wordSet)) visible++;
    }

    return { pointCounts: counts, visibleCount: visible };
  }, [currentYear, activeWordSets]);

  // Stable callback ref to avoid re-creating on every render
  const handleCloseDetail = useCallback(() => setSelectedPoint(null), []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Human-Mediated Dispersal of Cannabis</h1>
        <span className="subtitle">
          10,000 BCE – Present &middot; {visibleCount} data points visible
        </span>
      </header>

      <div className="app-body">
        <MapView
          points={sortedPoints}
          routes={dispersalRoutes}
          currentYear={currentYear}
          activeWordSets={activeWordSets}
          selectedPoint={selectedPoint}
          onSelectPoint={setSelectedPoint}
        />

        <button
          className={`legend-toggle ${legendOpen ? 'open' : ''}`}
          onClick={() => setLegendOpen(!legendOpen)}
          title="Toggle legend"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <rect x="2" y="3" width="5" height="3" rx="1" />
            <rect x="9" y="3.5" width="7" height="2" rx="1" />
            <rect x="2" y="8" width="5" height="3" rx="1" />
            <rect x="9" y="8.5" width="7" height="2" rx="1" />
            <rect x="2" y="13" width="5" height="3" rx="1" />
            <rect x="9" y="13.5" width="7" height="2" rx="1" />
          </svg>
        </button>

        {legendOpen && (
          <Legend
            activeWordSets={activeWordSets}
            onToggle={handleToggleWordSet}
            pointCounts={pointCounts}
          />
        )}

        {selectedPoint && (
          <DetailPanel
            point={selectedPoint}
            onClose={handleCloseDetail}
          />
        )}
      </div>

      <Timeline
        currentYear={currentYear}
        setCurrentYear={setCurrentYear}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />
    </div>
  );
}

export default App;
