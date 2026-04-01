import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { Map } from "leaflet";
import type {
  GeoJSONFeature,
  GroundTruth,
  Radar,
  Track,
} from "../hooks/useRadarData";
import "leaflet/dist/leaflet.css";
import { useRef, useState } from "react";
import MonostaticRadarMarker from "./RadarMarker";
import TrajectoryLayer from "./TrajectoryLayer";
import ClickPopup from "./ClickPopup";
import { extractState } from "../util/utils";
import IntervalSelector from "./IntervalSelector";
import { useSettings } from "../hooks/useSettings";

export default function RadarMap({
  time,
  blueMonostaticRadars,
  blueMonostaticCoverages,
  redTrajectories,
}: {
  time: Date;
  blueMonostaticRadars: Radar[];
  blueMonostaticCoverages: GeoJSONFeature[];
  redTrajectories: GroundTruth[] | Track[];
}) {
  const { settings } = useSettings();
  const mapRef = useRef(null as Map | null);
  const [visibleAltRange, setVisibleAltRange] = useState<[number, number]>([
    settings.minHeight,
    settings.maxHeight,
  ]);

  const visibleRedTrajectories = redTrajectories.filter((trajectory) => {
    const alt = extractState(time, trajectory).alt;
    return visibleAltRange[0] <= alt && alt <= visibleAltRange[1];
  });
  // const visibleRedTrajectories = redTrajectories;

  const monostaticRadarMarkers = blueMonostaticRadars.map((radar, i) => (
    <MonostaticRadarMarker
      key={i}
      radar={radar}
      onClick={function (): void {
        throw new Error("Function not implemented.");
      }}
    />
  ));
  const groundTruthLayers = visibleRedTrajectories.map((trajectory) => (
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

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        minHeight: 0,
        flexDirection: "row",
        gap: "10px",
      }}
    >
      <IntervalSelector
        selectedRange={visibleAltRange}
        setSelectedRange={setVisibleAltRange}
        values={redTrajectories.map(
          (trajectory) => extractState(time, trajectory).alt,
        )}
        range={[settings.minHeight, settings.maxHeight]}
        nBins={settings.nHeightBins}
      />
      <MapContainer
        center={[47.374444, 8.541111]}
        zoom={9}
        ref={mapRef}
        style={{
          height: "100%",
          width: "100%",
          flex: 18,
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
    </div>
  );
}
