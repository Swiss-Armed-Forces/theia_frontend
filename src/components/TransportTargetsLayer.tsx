import L from "leaflet";
import { useEffect, useRef } from "react";
import type { CampSiteState, TransportTime } from "../hooks/useGameData";
import type { Team } from "../hooks/useRadarData";
import { BLUE_GEOJSON_COLOR, RED_GEOJSON_COLOR } from "../contexts/constants";
import { actionTargetPane } from "../util/actionTargetPane";
import { formatDuration } from "../util/campSites";

const RADIUS = 18; // px, independent of the zoom level
const DISABLED_COLOR = "#9ca3af";
const STYLE = { weight: 2, opacity: 0.9, fillOpacity: 0.3 };
const HOVER_STYLE = { weight: 3, opacity: 1, fillOpacity: 0.55 };
const LINE_STYLE = { weight: 2, opacity: 0.9, dashArray: "6, 4" };

/** A route from the selected site, its destination and the route's time. */
function TransportDestination({
  map,
  source,
  destination,
  route,
  color,
  onPick,
}: {
  map: L.Map | null;
  source: CampSiteState;
  destination: CampSiteState;
  route: TransportTime;
  color: string;
  onPick: (destination: CampSiteState) => void;
}) {
  const circleRef = useRef<L.CircleMarker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);
  const enabledRef = useRef(destination.is_alive);
  const onPickRef = useRef(onPick);
  const destinationRef = useRef(destination);
  useEffect(() => {
    onPickRef.current = onPick;
    destinationRef.current = destination;
    enabledRef.current = destination.is_alive;
  });

  // Effect A: create the line and the circle once per map instance.
  useEffect(() => {
    if (!map) return;
    const pane = actionTargetPane(map);
    const line = L.polyline([], {
      ...LINE_STYLE,
      color,
      pane,
      interactive: false,
    });
    line.bindTooltip("", {
      permanent: true,
      direction: "center",
      className: "transport-time-label",
    });
    const circle = L.circleMarker([0, 0], {
      ...STYLE,
      radius: RADIUS,
      color,
      fillColor: color,
      pane,
      // Don't let the click reach the map (coordinate popup etc.).
      bubblingMouseEvents: false,
    });
    circle.bindTooltip("", { direction: "top", offset: [0, -RADIUS] });
    circle.on("mouseover", () => {
      if (enabledRef.current) circle.setStyle(HOVER_STYLE);
    });
    circle.on("mouseout", () => circle.setStyle(STYLE));
    circle.on("click", () => {
      if (enabledRef.current) onPickRef.current(destinationRef.current);
    });
    lineRef.current = line;
    circleRef.current = circle;
    return () => {
      line.remove();
      circle.remove();
      lineRef.current = null;
      circleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Effect B: push the latest data onto the existing layers every render.
  useEffect(() => {
    const line = lineRef.current;
    const circle = circleRef.current;
    if (!map || !line || !circle) return;
    const from = L.latLng(source.point.lat, source.point.lon);
    const to = L.latLng(destination.point.lat, destination.point.lon);
    const layerColor = destination.is_alive ? color : DISABLED_COLOR;
    const duration = formatDuration(
      route.seconds_until_leave + route.seconds_underway,
    );

    line.setLatLngs([from, to]);
    line.setStyle({ color: layerColor });
    circle.setLatLng(to);
    circle.setStyle({ color: layerColor, fillColor: layerColor });
    const container = circle.getElement();
    if (container instanceof SVGElement) {
      container.style.cursor = destination.is_alive ? "pointer" : "not-allowed";
    }
    circle.setTooltipContent(
      destination.is_alive
        ? `Transport to ${destination.name} (stock: ${destination.n_ammo})`
        : `${destination.name} is destroyed.`,
    );
    // Add after the positions are set, so the permanent tooltip is placed
    // at the line's centre right away.
    if (!map.hasLayer(line)) line.addTo(map);
    if (!map.hasLayer(circle)) circle.addTo(map);
    line.setTooltipContent(duration);
  });

  return null;
}

/**
 * Destinations of the transport routes that start at `source`: each one is
 * highlighted in the own colour and connected to the source by a dashed line
 * labelled with the transport time. A left-click on a destination picks it;
 * destroyed destinations are greyed out and can't be picked.
 */
export default function TransportTargetsLayer({
  map,
  team,
  source,
  campSites,
  transportTimes,
  onPick,
}: {
  map: L.Map | null;
  /** The own side */
  team: Team;
  source: CampSiteState;
  campSites: CampSiteState[];
  transportTimes: TransportTime[];
  onPick: (destination: CampSiteState) => void;
}) {
  const ownColor = team === "BLUE" ? BLUE_GEOJSON_COLOR : RED_GEOJSON_COLOR;
  return (
    <>
      {transportTimes
        .filter((route) => route.source_site_id === source.id)
        .map((route) => {
          const destination = campSites.find(
            (site) => site.id === route.target_site_id,
          );
          if (!destination) return null;
          return (
            <TransportDestination
              key={route.target_site_id}
              map={map}
              source={source}
              destination={destination}
              route={route}
              color={ownColor}
              onPick={onPick}
            />
          );
        })}
    </>
  );
}
