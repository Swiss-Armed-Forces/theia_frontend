import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { Map } from "leaflet";
import type {
  GeoJSONFeature,
  GroundTruth,
  Sensor,
  Track,
} from "../hooks/useRadarData";
import "leaflet/dist/leaflet.css";
import { useRef, useState } from "react";
import { MonostaticRadarMarker, PclSensorMarkers } from "./RadarMarker";
import TrajectoryLayer from "./TrajectoryLayer";
import ClickPopup from "./ClickPopup";
import { extractState } from "../util/utils";
import IntervalSelector from "./IntervalSelector";
import type { Settings } from "../contexts/SettingsContext";

export default function RadarMap({
  settings,
  time,
  blueMonostaticRadars,
  bluePclSensors,
  blueTrackInitCoverages,
  blueTrackUpdateCoverages,
  redTrajectories,
}: {
  settings: Settings;
  time: Date;
  blueMonostaticRadars: Sensor[];
  bluePclSensors: Sensor[];
  blueTrackInitCoverages: GeoJSONFeature[];
  blueTrackUpdateCoverages: GeoJSONFeature[];
  redTrajectories: GroundTruth[] | Track[];
}) {
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
  const pclSensorMarkers = bluePclSensors.map((sensor, i) => (
    <PclSensorMarkers key={i} sensor={sensor} />
  ));
  const groundTruthLayers = visibleRedTrajectories.map((trajectory) => (
    <TrajectoryLayer
      key={"id" in trajectory ? parseInt(trajectory.id) : trajectory.target_id}
      trajectory={trajectory}
      currentTime={time}
      isBlue={false}
    />
  ));

  const trackUpdateCoverageLayers = blueTrackUpdateCoverages.map(
    (coverage, i) => (
      <GeoJSON
        key={i}
        data={coverage}
        interactive={false}
        style={{ color: settings.accent }}
      />
    ),
  );
  const trackInitCoverageLayers = blueTrackInitCoverages.map((coverage, i) => (
    <GeoJSON key={i} data={coverage} interactive={false} />
  ));

  console.log(settings.tileServerConfig.name);

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
          attribution={settings.tileServerConfig.attribution}
          url={settings.tileServerConfig.url}
          subdomains={["a", "b", "c"]}
        />
        {trackUpdateCoverageLayers}
        {trackInitCoverageLayers}
        {monostaticRadarMarkers}
        {pclSensorMarkers}
        {groundTruthLayers}
        <ClickPopup />
      </MapContainer>
      <div
        style={{
          position: "absolute",
          top: 15,
          right: 15,
          zIndex: 1000, // above the map
          background: "var(--panel-bg)",
          padding: "10px 14px",
          borderRadius: 8,
          // boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          fontSize: 14,
          color: "var(--text)",
        }}
      >
        <strong>Legend</strong>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 6,
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              background: "var(--primary)",
              display: "inline-block",
              borderRadius: 3,
            }}
          />
          Track Init coverage
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 6,
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              background: "var(--accent)",
              display: "inline-block",
              borderRadius: 3,
            }}
          />
          Track Update coverage
        </div>
      </div>
    </div>
  );
}
