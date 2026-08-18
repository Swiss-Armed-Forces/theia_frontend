import { Marker, Tooltip } from "react-leaflet";
import type { GroundTruth, Point, Track } from "../hooks/useRadarData";
import ms from "milsymbol";
import L from "leaflet";
import type { JSX } from "react";

function TargetMarker({
  children,
  position,
  sidc,
}: {
  children: JSX.Element;
  position: Point;
  sidc: string;
}) {
  const symbol = new ms.Symbol(sidc, {
    size: 24,
  });

  const icon = L.divIcon({
    html: symbol.asSVG(),
    className: "", // remove default 'leaflet-div-icon' styles if needed
    iconSize: [24, 24],
    iconAnchor: [12, 12], // center the icon
  });
  return (
    <Marker position={[position.lat, position.lon]} icon={icon}>
      {children}
    </Marker>
  );
}

export default function TrajectoryLayer({
  trajectory,
}: {
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
    "\u00A0".repeat(maxBefore - s.indexOf(".")) + s;

  const tooltip = (
    <Tooltip direction="top" offset={[0, -10]}>
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
    </Tooltip>
  );
  return (
    <>
      <TargetMarker position={currentPoint} sidc={trajectory.sidc}>
        {tooltip}
      </TargetMarker>
    </>
  );
}
