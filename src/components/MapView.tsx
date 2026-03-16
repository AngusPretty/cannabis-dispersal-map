import { useEffect, useMemo, memo } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
  useMap,
} from 'react-leaflet';
import type { DispersalPoint, DispersalRoute, WordSet } from '../data/dispersalData';
import { WORD_SET_META } from '../data/dispersalData';

interface Props {
  points: DispersalPoint[];
  routes: DispersalRoute[];
  currentYear: number;
  activeWordSets: Set<WordSet>;
  selectedPoint: DispersalPoint | null;
  onSelectPoint: (p: DispersalPoint | null) => void;
}

// Compute arrowhead as a polyline "V" shape — uses canvas renderer, no DOM overhead
function getArrowHead(
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
  headLat: number, headLng: number
): [number, number][] {
  const dx = toLng - fromLng;
  const dy = toLat - fromLat;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return [];

  const size = Math.min(1.2, len * 0.08);
  const ux = dx / len;
  const uy = dy / len;
  // Perpendicular
  const px = -uy * size * 0.6;
  const py = ux * size * 0.6;
  // Back along line
  const bx = -ux * size;
  const by = -uy * size;

  return [
    [headLat + py + by, headLng + px + bx],
    [headLat, headLng],
    [headLat - py + by, headLng - px + bx],
  ];
}

const AnimatedRoute = memo(function AnimatedRoute({
  route,
  currentYear,
}: {
  route: DispersalRoute;
  currentYear: number;
}) {
  const color = WORD_SET_META[route.wordSet].color;
  const duration = route.dateEnd - route.dateStart || 1;
  const progress = Math.min(1, Math.max(0, (currentYear - route.dateStart) / duration));

  if (progress <= 0) return null;

  const [fromLat, fromLng] = route.from;
  const [toLat, toLng] = route.to;
  const midLat = fromLat + (toLat - fromLat) * progress;
  const midLng = fromLng + (toLng - fromLng) * progress;

  const positions: [number, number][] = [
    [fromLat, fromLng],
    [midLat, midLng],
  ];

  const arrowHead = progress > 0.08
    ? getArrowHead(fromLat, fromLng, toLat, toLng, midLat, midLng)
    : [];

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{ color, weight: 1.5, opacity: 0.3, dashArray: '8 6' }}
      />
      {arrowHead.length > 0 && (
        <Polyline
          positions={arrowHead}
          pathOptions={{ color, weight: 1.5, opacity: 0.5, fill: false }}
        />
      )}
    </>
  );
});

function FitBoundsOnMount() {
  const map = useMap();
  useEffect(() => {
    map.setView([33, 65], 3);
  }, [map]);
  return null;
}

const PointMarker = memo(function PointMarker({
  point,
  isSelected,
  currentYear,
  onSelect,
}: {
  point: DispersalPoint;
  isSelected: boolean;
  currentYear: number;
  onSelect: () => void;
}) {
  const color = WORD_SET_META[point.wordSet].color;
  const age = currentYear - point.dateStart;
  const radius = Math.max(4, Math.min(9, 4 + age / 1200));

  return (
    <CircleMarker
      center={[point.lat, point.lng]}
      radius={isSelected ? radius + 4 : radius}
      pathOptions={{
        color: isSelected ? '#c9a84c' : color,
        fillColor: color,
        fillOpacity: isSelected ? 0.95 : 0.7,
        weight: isSelected ? 2 : 1,
      }}
      eventHandlers={{ click: onSelect }}
    >
      <Tooltip direction="top" offset={[0, -8]} className="custom-tooltip">
        <strong>{point.name}</strong>
        <br />
        {point.language}
        <br />
        <span style={{ opacity: 0.6 }}>
          {formatYear(point.dateStart)}
          {point.dateEnd !== point.dateStart && ` – ${formatYear(point.dateEnd)}`}
        </span>
      </Tooltip>
    </CircleMarker>
  );
});

export default function MapView({
  points,
  routes,
  currentYear,
  activeWordSets,
  selectedPoint,
  onSelectPoint,
}: Props) {
  const visiblePoints = useMemo(
    () =>
      points.filter(
        (p) => p.dateStart <= currentYear && activeWordSets.has(p.wordSet)
      ),
    [points, currentYear, activeWordSets]
  );

  const visibleRoutes = useMemo(
    () =>
      routes.filter(
        (r) => r.dateStart <= currentYear && activeWordSets.has(r.wordSet)
      ),
    [routes, currentYear, activeWordSets]
  );

  return (
    <MapContainer
      center={[33, 65]}
      zoom={3}
      minZoom={2}
      maxZoom={10}
      className="map-container"
      zoomControl={false}
      preferCanvas={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      />
      <FitBoundsOnMount />

      {visibleRoutes.map((route) => (
        <AnimatedRoute key={route.id} route={route} currentYear={currentYear} />
      ))}

      {visiblePoints.map((point) => (
        <PointMarker
          key={point.id}
          point={point}
          isSelected={selectedPoint?.id === point.id}
          currentYear={currentYear}
          onSelect={() => onSelectPoint(selectedPoint?.id === point.id ? null : point)}
        />
      ))}
    </MapContainer>
  );
}

function formatYear(y: number): string {
  if (y < 0) return `${Math.abs(y).toLocaleString()} BCE`;
  if (y === 0) return '1 CE';
  return `${y} CE`;
}
