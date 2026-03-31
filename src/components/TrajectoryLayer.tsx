import { CircleMarker, Polyline, Tooltip } from "react-leaflet";
import type { GroundTruth, Track } from "../hooks/useRadarData";

export default function TrajectoryLayer({
  trajectory,
  currentTime,
  isBlue,
}: {
  trajectory: GroundTruth | Track;
  currentTime: Date;
  isBlue: boolean;
}) {
  if (trajectory.points.length < 2) {
    return <div></div>;
  }
  const currentPoint = trajectory.points.reduce((closest, point) => {
    const currentDiff = Math.abs(
      new Date(point.time).getTime() - currentTime.getTime(),
    );
    const closestDiff = Math.abs(
      new Date(closest.time).getTime() - currentTime.getTime(),
    );
    return currentDiff < closestDiff ? point : closest;
  });
  const pastPoints = trajectory.points.filter(
    (point) => new Date(point.time) <= currentTime,
  );
  const firstFuturePoint =
    pastPoints.length > 0 ? [pastPoints[pastPoints.length - 1]] : [];
  const futurePoints = firstFuturePoint.concat(
    trajectory.points.filter((point) => new Date(point.time) > currentTime),
  );

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
      <Polyline
        color={isBlue ? "blue" : "red"}
        positions={pastPoints.map((p) => [p.lat, p.lon])}
      >
        {tooltip}
      </Polyline>
      <CircleMarker
        center={[currentPoint.lat, currentPoint.lon]}
        radius={5}
        color="red"
        fillColor="red"
        fillOpacity={100}
      >
        {tooltip}
      </CircleMarker>
      <Polyline
        color={isBlue ? "blue" : "red"}
        positions={futurePoints.map((p) => [p.lat, p.lon])}
        pathOptions={{ dashArray: "10, 10" }}
      >
        {tooltip}
      </Polyline>
    </>
  );
}
