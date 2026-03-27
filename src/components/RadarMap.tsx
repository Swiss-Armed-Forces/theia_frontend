import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { Map } from "leaflet";
import type {
  GeoJSONFeature,
  GroundTruth,
  Radar,
  Track,
} from "../hooks/useRadarData";
import "leaflet/dist/leaflet.css";
import { useRef } from "react";
import MonostaticRadarMarker from "./RadarMarker";
import TrajectoryLayer from "./TrajectoryLayer";
import ClickPopup from "./ClickPopup";

export default function RadarMap({
  time,
  blueMonostaticRadars,
  blueMonostaticCoverages,
  redTrajectories,
}: {
  time: Date;
  blueMonostaticRadars: Radar[];
  blueMonostaticCoverages: GeoJSONFeature[];
  redTargetGroundTruths: GroundTruth[];
  redTrajectories: GroundTruth[] | Track[];
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
  const groundTruthLayers = redTrajectories.map((trajectory) => (
    <TrajectoryLayer
      key={"id" in trajectory ? parseInt(trajectory.id) : trajectory.target_id}
      trajectory={trajectory}
      currentTime={time}
      isBlue={false}
    />
  ));
  const coverageLayers = blueMonostaticCoverages.map((coverage, i) => (
    <GeoJSON key={i} data={coverage} interactive={false} />
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
      {coverageLayers}
      {monostaticRadarMarkers}
      {groundTruthLayers}
      <ClickPopup />
    </MapContainer>
  );
  return <div style={{ width: "80vw", height: "80vh" }}>{map}</div>;
}
