import type { GroundTruth, Point, Track } from "../hooks/useRadarData";
import ms from "milsymbol";
import L from "leaflet";
import { useEffect, useRef, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const TOOLTIP_OPTS: L.TooltipOptions = { direction: "top", offset: [0, -10] };

function TargetMarker({
  map,
  tooltip,
  position,
  sidc,
}: {
  map: L.Map | null;
  tooltip: ReactElement;
  position: Point;
  sidc: string;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  // Effect A: create the marker once per map instance.
  useEffect(() => {
    if (!map) return;
    const symbol = new ms.Symbol(sidc, { size: 24 });
    const icon = L.divIcon({
      html: symbol.asSVG(),
      className: "", // remove default 'leaflet-div-icon' styles if needed
      iconSize: [24, 24],
      iconAnchor: [12, 12], // center the icon
    });
    const marker = L.marker([position.lat, position.lon], { icon });
    marker.addTo(map);
    markerRef.current = marker;
    return () => {
      marker.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Effect B: push the latest data onto the existing marker every render,
  // without removing/re-adding it, to avoid flicker on each poll tick.
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.setLatLng([position.lat, position.lon]);
    const symbol = new ms.Symbol(sidc, { size: 24 });
    marker.setIcon(
      L.divIcon({
        html: symbol.asSVG(),
        className: "",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    );
    marker.bindTooltip(renderToStaticMarkup(tooltip), TOOLTIP_OPTS);
  });

  return null;
}

export default function TrajectoryLayer({
  map,
  trajectory,
}: {
  map: L.Map | null;
  trajectory: GroundTruth | Track;
}) {
  const currentPoint = trajectory.points[0];
  const id = "target_id" in trajectory ? trajectory.target_id : trajectory.id;

  const latStr = currentPoint.lat.toFixed(4);
  const lonStr = currentPoint.lon.toFixed(4);
  const altStr = currentPoint.alt.toFixed(0);

  const maxBefore = Math.max(
    latStr.indexOf("."),
    lonStr.indexOf("."),
    altStr.indexOf("."),
  );

  const alignDecimal = (s: string) =>
    " ".repeat(maxBefore - s.indexOf(".")) + s;

  const tooltip = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto",
        columnGap: "8px",
        fontFamily: "monospace",
      }}
    >
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        {"target_id" in trajectory ? "Target ID:" : "Track ID:"}
      </span>
      <span>{id}</span>
      {"name" in trajectory && trajectory.name && (
        <>
          <span style={{ textAlign: "right", fontWeight: "bold" }}>
            Name:
          </span>
          <span>{trajectory.name}</span>
        </>
      )}
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        Latitude:
      </span>
      <span>{alignDecimal(latStr)} °</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        Longitude:
      </span>
      <span>{alignDecimal(lonStr)} °</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        Altitude [MASL]:
      </span>
      <span>{altStr} m</span>
    </div>
  );
  return (
    <TargetMarker
      map={map}
      position={currentPoint}
      sidc={trajectory.sidc}
      tooltip={tooltip}
    />
  );
}
