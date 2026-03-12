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
  if (trajectory.points.length == 0) {
    return <div></div>;
  }
  const pastPoints = trajectory.points.filter(
    (point) => new Date(point.time) <= currentTime,
  );
  const futurePoints = [pastPoints[pastPoints.length - 1]].concat(
    trajectory.points.filter((point) => new Date(point.time) > currentTime),
  );
  const currentPoint = trajectory.points.reduce((closest, point) => {
    const currentDiff = Math.abs(
      new Date(point.time).getTime() - currentTime.getTime(),
    );
    const closestDiff = Math.abs(
      new Date(closest.time).getTime() - currentTime.getTime(),
    );
    return currentDiff < closestDiff ? point : closest;
  });
  const id = "target_id" in trajectory ? trajectory.target_id : trajectory.id;
  const tooltip = (
    <Tooltip>
      <div>
        {"target_id" in trajectory ? `Target ID: ${id}` : `Track ID: ${id}`}
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
      />
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
