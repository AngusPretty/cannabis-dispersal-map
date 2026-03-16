import type { DispersalPoint } from '../data/dispersalData';
import { WORD_SET_META } from '../data/dispersalData';

interface Props {
  point: DispersalPoint;
  onClose: () => void;
}

export default function DetailPanel({ point, onClose }: Props) {
  const meta = WORD_SET_META[point.wordSet];

  return (
    <div className="detail-panel">
      <button className="detail-close" onClick={onClose}>
        &times;
      </button>

      <div className="detail-header" style={{ borderLeftColor: meta.color }}>
        <h2>{point.name}</h2>
        <span className="detail-badge" style={{ backgroundColor: meta.color }}>
          {meta.label}
        </span>
      </div>

      <div className="detail-body">
        <div className="detail-row">
          <span className="detail-key">Language</span>
          <span className="detail-val">{point.language}</span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Family</span>
          <span className="detail-val">{point.family}</span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Date</span>
          <span className="detail-val">
            {formatYear(point.dateStart)}
            {point.dateEnd !== point.dateStart && ` – ${formatYear(point.dateEnd)}`}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Evidence</span>
          <span className="detail-val capitalize">{point.evidenceType}</span>
        </div>
        <div className="detail-row">
          <span className="detail-key">Use</span>
          <span className="detail-val">{point.useType}</span>
        </div>
        {point.territory && (
          <div className="detail-row">
            <span className="detail-key">Territory</span>
            <span className="detail-val">{point.territory}</span>
          </div>
        )}
        <p className="detail-desc">{point.description}</p>
        {point.source && <p className="detail-source">{point.source}</p>}
      </div>
    </div>
  );
}

function formatYear(y: number): string {
  if (y < 0) return `${Math.abs(y).toLocaleString()} BCE`;
  if (y === 0) return '1 CE';
  return `${y.toLocaleString()} CE`;
}
