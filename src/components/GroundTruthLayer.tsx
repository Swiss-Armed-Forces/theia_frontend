import { CircleMarker, Polyline, Tooltip } from "react-leaflet";
import type { GroundTruth } from "../hooks/useRadarData";

export default function GroundTruthLayer({
  groundTruth,
  currentTime,
  isBlue,
}: {
  groundTruth: GroundTruth;
  currentTime: Date;
  isBlue: boolean;
}) {
  const pastPoints = groundTruth.points.filter(
    (point) => new Date(point.time) <= currentTime,
  );
  const futurePoints = [pastPoints[pastPoints.length - 1]].concat(
    groundTruth.points.filter((point) => new Date(point.time) > currentTime),
  );
  const currentPoint = groundTruth.points.reduce((closest, point) => {
    const currentDiff = Math.abs(
      new Date(point.time).getTime() - currentTime.getTime(),
    );
    const closestDiff = Math.abs(
      new Date(closest.time).getTime() - currentTime.getTime(),
    );
    return currentDiff < closestDiff ? point : closest;
  });
  return (
    <>
      <Polyline
        color={isBlue ? "blue" : "red"}
        positions={pastPoints.map((p) => [p.lat, p.lon])}
      >
        <Tooltip>
          <div>Target ID: {groundTruth.target_id}</div>
        </Tooltip>
      </Polyline>
      <CircleMarker
        center={[currentPoint.lat, currentPoint.lon]}
        radius={5}
        color="red"
        fillColor="red"
        fillOpacity={100}
      />
      <Polyline
        color={isBlue ? "blue" : "red"}
        positions={futurePoints.map((p) => [p.lat, p.lon])}
        pathOptions={{ dashArray: "10, 10" }}
      >
        <Tooltip>
          <div>Target ID: {groundTruth.target_id}</div>
        </Tooltip>
      </Polyline>
    </>
  );
}
