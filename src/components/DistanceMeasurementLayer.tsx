import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import type { Point } from "../hooks/useRadarData";
import { fetchElevation, fetchLineOfSightDistance } from "../hooks/terrain";

// Same tool as in the scenario editor (ScenarioMap.tsx, DistanceMeasurementLayer).
const COLOR = "#ff5722";
const LINE_STYLE = { color: COLOR, weight: 2, dashArray: "6, 4" };
const POINT_ICON = L.divIcon({
  html: `<div style="width:10px;height:10px;border-radius:50%;background:${COLOR};border:2px solid white;box-shadow:0 0 2px rgba(0,0,0,0.6)"></div>`,
  className: "",
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

/** "?" if the distance could not be fetched (NaN) */
function formatKm(meters: number): string {
  return Number.isNaN(meters) ? "?" : `${(meters / 1000).toFixed(0)} km`;
}

/**
 * Distance measurement tool.
 *
 * Shift+click on the map adds a point (at the terrain elevation). Each
 * segment is labelled with its terrain-aware line-of-sight distance, the last
 * point with the total. A plain click removes the measurement.
 *
 * @param points the points of the measurement; empty when inactive
 * @param onPointsChange called with the new points
 * @param enabled whether map clicks change the measurement; off while the
 *   player picks an action's target
 */
export default function DistanceMeasurementLayer({
  map,
  points,
  onPointsChange,
  enabled,
}: {
  map: L.Map | null;
  points: Point[];
  onPointsChange: (points: Point[]) => void;
  enabled: boolean;
}) {
  const pointsRef = useRef(points);
  const onPointsChangeRef = useRef(onPointsChange);
  useEffect(() => {
    pointsRef.current = points;
    onPointsChangeRef.current = onPointsChange;
  });

  // Clicks: Shift adds a point, a plain click removes the measurement.
  useEffect(() => {
    if (!map || !enabled) return;
    const mapInstance = map;
    let active = true;

    function handleClick(e: L.LeafletMouseEvent) {
      if (e.originalEvent.shiftKey) {
        const { lat, lng } = e.latlng;
        fetchElevation(lat, lng)
          .then((alt) => {
            if (!active) return;
            onPointsChangeRef.current([
              ...pointsRef.current,
              { lat, lon: lng, alt },
            ]);
          })
          .catch((error: unknown) => console.error(error));
      } else if (pointsRef.current.length > 0) {
        onPointsChangeRef.current([]);
      }
    }

    mapInstance.on("click", handleClick);
    return () => {
      active = false;
      mapInstance.off("click", handleClick);
    };
  }, [map, enabled]);

  // Rapid Shift+clicks would otherwise be read as a double click and zoom.
  const isActive = points.length > 0;
  useEffect(() => {
    if (!map || !isActive) return;
    map.doubleClickZoom.disable();
    return () => {
      map.doubleClickZoom.enable();
    };
  }, [map, isActive]);

  // Segment distances from the backend; undefined while loading, NaN on error.
  const [distances, setDistances] = useState<{
    points: Point[];
    values: number[];
  } | null>(null);
  useEffect(() => {
    if (points.length < 2) return;
    let cancelled = false;
    Promise.all(
      points
        .slice(1)
        .map((p, i) =>
          fetchLineOfSightDistance(points[i], p).catch((error: unknown) => {
            console.error(error);
            return NaN;
          }),
        ),
    ).then((values) => {
      if (!cancelled) setDistances({ points, values });
    });
    return () => {
      cancelled = true;
    };
  }, [points]);
  const segmentDistances =
    distances !== null && distances.points === points ? distances.values : null;

  // Draw the points, the segments and the labels.
  useEffect(() => {
    if (!map || points.length === 0) return;
    const group = L.layerGroup().addTo(map);

    points.slice(1).forEach((p, i) => {
      const distance = segmentDistances?.[i];
      L.polyline(
        [
          [points[i].lat, points[i].lon],
          [p.lat, p.lon],
        ],
        { ...LINE_STYLE, interactive: false },
      )
        .bindTooltip(
          distance === undefined ? "..." : formatKm(distance),
          { permanent: true, direction: "center" },
        )
        .addTo(group);
    });

    points.forEach((p, i) => {
      const marker = L.marker([p.lat, p.lon], {
        icon: POINT_ICON,
        interactive: false,
        keyboard: false,
      }).addTo(group);
      if (i === points.length - 1 && points.length > 1) {
        const total =
          segmentDistances === null
            ? "..."
            : formatKm(segmentDistances.reduce((sum, d) => sum + d, 0));
        marker.bindTooltip(`Total: ${total}`, {
          permanent: true,
          direction: "top",
          offset: [0, -8],
        });
      }
    });

    return () => {
      group.remove();
    };
  }, [map, points, segmentDistances]);

  return null;
}
