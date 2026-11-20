import L from "leaflet";
import { useEffect, useRef } from "react";
import type { Point, Team, Track } from "../hooks/useRadarData";
import { BLUE_GEOJSON_COLOR, RED_GEOJSON_COLOR } from "../contexts/constants";
import { formatCategory } from "../util/utils";

/**
 * Pane of the target highlights: above the markers (600), so the target
 * symbols don't cover the circles and catch their clicks, and below the
 * tooltips (650).
 */
const TARGET_PANE = "actionTargetPane";
const TARGET_PANE_Z_INDEX = "640";

const RADIUS = 18; // px, independent of the zoom level
const STYLE = { weight: 2, opacity: 0.9, fillOpacity: 0.3 };
const HOVER_STYLE = { weight: 3, opacity: 1, fillOpacity: 0.55 };

function targetPane(map: L.Map): string {
  if (!map.getPane(TARGET_PANE)) {
    map.createPane(TARGET_PANE).style.zIndex = TARGET_PANE_Z_INDEX;
  }
  return TARGET_PANE;
}

function AttackTargetCircle({
  map,
  track,
  color,
  onPick,
}: {
  map: L.Map | null;
  track: Track;
  color: string;
  onPick: (destination: Point) => void;
}) {
  const circleRef = useRef<L.CircleMarker | null>(null);
  const onPickRef = useRef(onPick);
  // Same position as the track's marker (see TrajectoryLayer).
  const position = track.points[0];
  const positionRef = useRef(position);
  useEffect(() => {
    onPickRef.current = onPick;
    positionRef.current = position;
  });

  // Effect A: create the circle once per map instance.
  useEffect(() => {
    if (!map) return;
    const { lat, lon } = positionRef.current;
    const circle = L.circleMarker([lat, lon], {
      ...STYLE,
      radius: RADIUS,
      color,
      fillColor: color,
      pane: targetPane(map),
      // Don't let the click reach the map (coordinate popup etc.).
      bubblingMouseEvents: false,
    });
    circle.bindTooltip("", { direction: "top", offset: [0, -RADIUS] });
    circle.on("mouseover", () => circle.setStyle(HOVER_STYLE));
    circle.on("mouseout", () => circle.setStyle(STYLE));
    circle.on("click", () => {
      const { lat, lon, alt } = positionRef.current;
      onPickRef.current({ lat, lon, alt });
    });
    circle.addTo(map);
    circleRef.current = circle;
    return () => {
      circle.remove();
      circleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Effect B: follow the track without re-creating the circle.
  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    circle.setLatLng([position.lat, position.lon]);
    circle.setStyle({ color, fillColor: color });
    const category =
      track.info.category === "UNKNOWN"
        ? ""
        : ` · ${formatCategory(track.info.category)}`;
    circle.setTooltipContent(`Attack track ${track.id}${category}`);
  });

  return null;
}

/**
 * Semi-transparent circles in the enemy's colour around the enemy ground
 * tracks the player can attack. A left-click on a circle picks its track's
 * current position as the destination.
 */
export default function AttackTargetsLayer({
  map,
  team,
  targets,
  onPick,
}: {
  map: L.Map | null;
  /** The attacking side */
  team: Team;
  targets: Track[];
  onPick: (destination: Point) => void;
}) {
  const enemyColor = team === "BLUE" ? RED_GEOJSON_COLOR : BLUE_GEOJSON_COLOR;
  return (
    <>
      {targets.map((track) => (
        <AttackTargetCircle
          key={track.id}
          map={map}
          track={track}
          color={enemyColor}
          onPick={onPick}
        />
      ))}
    </>
  );
}
