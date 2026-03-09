import { Polyline, Tooltip } from "react-leaflet";
import type { GroundTruth } from "../hooks/useRadarData";

export default function GroundTruthLayer({
  groundTruth,
  isBlue,
}: {
  groundTruth: GroundTruth;
  isBlue: boolean;
}) {
  return (
    <Polyline
      color={isBlue ? "blue" : "red"}
      positions={groundTruth.points.map((p) => [p.lat, p.lon])}
    >
      <Tooltip>
        <div>Target ID: {groundTruth.target_id}</div>
      </Tooltip>
    </Polyline>
  );
}
