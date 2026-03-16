import type { WordSet } from '../data/dispersalData';
import { WORD_SET_META } from '../data/dispersalData';

interface Props {
  activeWordSets: Set<WordSet>;
  onToggle: (ws: WordSet) => void;
  pointCounts: Record<WordSet, number>;
}

const WORD_SET_ORDER: WordSet[] = [
  'sino-tibetan',
  'kanap',
  'san',
  'bhanga',
  'ganja',
  'tai',
  'austroasiatic',
  'other',
];

export default function Legend({ activeWordSets, onToggle, pointCounts }: Props) {
  return (
    <div className="legend">
      <h3>Word-Root Families</h3>
      {WORD_SET_ORDER.map((ws) => {
        const meta = WORD_SET_META[ws];
        const active = activeWordSets.has(ws);
        const count = pointCounts[ws] || 0;
        return (
          <button
            key={ws}
            className={`legend-item ${active ? 'active' : 'inactive'}`}
            onClick={() => onToggle(ws)}
            title={meta.description}
          >
            <span
              className="legend-dot"
              style={{ backgroundColor: active ? meta.color : '#555' }}
            />
            <span className="legend-label">{meta.label}</span>
            <span className="legend-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
