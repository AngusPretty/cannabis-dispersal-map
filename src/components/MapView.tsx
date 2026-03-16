import { useEffect, useRef, useMemo } from 'react';
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

function AnimatedRoute({
  route,
  currentYear,
}: {
  route: DispersalRoute;
  currentYear: number;
}) {
  const color = WORD_SET_META[route.wordSet].color;
  const progress = Math.min(
    1,
    Math.max(0, (currentYear - route.dateStart) / (route.dateEnd - route.dateStart || 1))
  );

  if (progress <= 0) return null;

  const [fromLat, fromLng] = route.from;
  const [toLat, toLng] = route.to;
  const midLat = fromLat + (toLat - fromLat) * progress;
  const midLng = fromLng + (toLng - fromLng) * progress;

  return (
    <>
      {/* Glow layer */}
      <Polyline
        positions={[
          [fromLat, fromLng],
          [midLat, midLng],
        ]}
        pathOptions={{
          color,
          weight: 6,
          opacity: 0.08,
        }}
      />
      {/* Main line */}
      <Polyline
        positions={[
          [fromLat, fromLng],
          [midLat, midLng],
        ]}
        pathOptions={{
          color,
          weight: 1.5,
          opacity: 0.35,
          dashArray: '8 6',
        }}
      />
    </>
  );
}

function FitBoundsOnMount() {
  const map = useMap();
  useEffect(() => {
    map.setView([33, 65], 3);
  }, [map]);
  return null;
}

export default function MapView({
  points,
  routes,
  currentYear,
  activeWordSets,
  selectedPoint,
  onSelectPoint,
}: Props) {
  const mapRef = useRef(null);

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
      ref={mapRef}
      center={[33, 65]}
      zoom={3}
      minZoom={2}
      maxZoom={10}
      className="map-container"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      />
      <FitBoundsOnMount />

      {visibleRoutes.map((route) => (
        <AnimatedRoute key={route.id} route={route} currentYear={currentYear} />
      ))}

      {visiblePoints.map((point) => {
        const color = WORD_SET_META[point.wordSet].color;
        const isSelected = selectedPoint?.id === point.id;
        const age = currentYear - point.dateStart;
        const radius = Math.max(4, Math.min(9, 4 + age / 1200));

        return (
          <CircleMarker
            key={point.id}
            center={[point.lat, point.lng]}
            radius={isSelected ? radius + 4 : radius}
            pathOptions={{
              color: isSelected ? '#c9a84c' : color,
              fillColor: color,
              fillOpacity: isSelected ? 0.95 : 0.7,
              weight: isSelected ? 2 : 1,
            }}
            eventHandlers={{
              click: () => onSelectPoint(isSelected ? null : point),
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -8]}
              className="custom-tooltip"
            >
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
      })}
    </MapContainer>
  );
}

function formatYear(y: number): string {
  if (y < 0) return `${Math.abs(y).toLocaleString()} BCE`;
  if (y === 0) return '1 CE';
  return `${y} CE`;
}
