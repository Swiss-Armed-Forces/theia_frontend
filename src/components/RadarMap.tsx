import { MapContainer, TileLayer } from "react-leaflet";
import { Map } from "leaflet";
import type { GroundTruth, Radar } from "../hooks/useRadarData";
import "leaflet/dist/leaflet.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useRef } from "react";
import MonostaticRadarMarker from "./RadarMarker";
import GroundTruthLayer from "./GroundTruthLayer";

export default function RadarMap({
  time,
  blueMonostaticRadars,
  redTargetGroundTruths,
}: {
  time: Date;
  blueMonostaticRadars: Radar[];
  redTargetGroundTruths: GroundTruth[];
}) {
  const mapRef = useRef(null as Map | null);

  const monostaticRadarMarkers = blueMonostaticRadars.map((radar, i) => (
    <MonostaticRadarMarker
      key={i}
      radar={radar}
      onClick={function (): void {
        throw new Error("Function not implemented.");
      }}
    />
  ));
  const groundTruthLayers = redTargetGroundTruths.map((gt, i) => (
    <GroundTruthLayer key={i} groundTruth={gt} isBlue={false} />
  ));

  const map = (
    <MapContainer
      center={[47.374444, 8.541111]}
      zoom={9}
      ref={mapRef}
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        subdomains={["a", "b", "c"]}
      />
      {monostaticRadarMarkers}
      {groundTruthLayers}
    </MapContainer>
  );
  console.log(time.toISOString());
  return <div style={{ width: "80vw", height: "80vh" }}>{map}</div>;
}
