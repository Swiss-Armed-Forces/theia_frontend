import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { Map } from "leaflet";
import type {
  GeoJSONFeature,
  GroundTruth,
  Sensor,
  Track,
} from "../hooks/useRadarData";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MonostaticRadarMarker, PclSensorMarkers } from "./RadarMarker";
import TrajectoryLayer from "./TrajectoryLayer";
import ClickPopup from "./ClickPopup";
import { extractState } from "../util/utils";
import IntervalSelector from "./IntervalSelector";
import { useSettings } from "../hooks/useSettings";
import { BLUE_GEOJSON_COLOR, RED_GEOJSON_COLOR } from "../contexts/constants";

export default function RadarMap({
  time,
  blueMonostaticRadars,
  bluePclSensors,
  blueGeoJson,
  redGeoJson,
  hiddenBlueKeys,
  hiddenRedKeys,
  trajectories,
  resizeTrigger,
}: {
  time: Date;
  blueMonostaticRadars: Sensor[];
  bluePclSensors: Sensor[];
  blueGeoJson: Record<string, GeoJSONFeature>;
  redGeoJson: Record<string, GeoJSONFeature>;
  hiddenBlueKeys: Set<string>;
  hiddenRedKeys: Set<string>;
  trajectories: (GroundTruth | Track)[];
  resizeTrigger?: boolean;
}) {
  const { settings } = useSettings();
  const mapRef = useRef(null as Map | null);

  useEffect(() => {
    mapRef.current?.invalidateSize();
  }, [resizeTrigger]);
  const [visibleAltRange, setVisibleAltRange] = useState<[number, number]>([
    settings.minHeight,
    settings.maxHeight,
  ]);

  const visibleTrajectories = trajectories.filter((trajectory) => {
    const alt = extractState(time, trajectory).alt;
    return visibleAltRange[0] <= alt && alt <= visibleAltRange[1];
  });

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
  const groundTruthLayers = visibleTrajectories.map((trajectory) => (
    <TrajectoryLayer
      key={
        "id" in trajectory
          ? `TRACK ${trajectory.id}`
          : `TRUTH ${trajectory.target_id}`
      }
      trajectory={trajectory}
      currentTime={time}
      isBlue={false}
    />
  ));

  const blueGeoJsonStyle = { color: BLUE_GEOJSON_COLOR, fillOpacity: 0.3 };
  const redGeoJsonStyle = { color: RED_GEOJSON_COLOR, fillOpacity: 0.3 };

  const blueGeoJsonLayers = Object.entries(blueGeoJson)
    .filter(([key]) => !hiddenBlueKeys.has(key))
    .map(([key, feature]) => (
      <GeoJSON
        key={key}
        data={feature}
        interactive={true}
        style={blueGeoJsonStyle}
        onEachFeature={(_feature, layer) => layer.bindTooltip(key)}
      />
    ));
  const redGeoJsonLayers = Object.entries(redGeoJson)
    .filter(([key]) => !hiddenRedKeys.has(key))
    .map(([key, feature]) => (
      <GeoJSON
        key={key}
        data={feature}
        interactive={true}
        style={redGeoJsonStyle}
        onEachFeature={(_feature, layer) => layer.bindTooltip(key)}
      />
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
        values={trajectories.map(
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
        {blueGeoJsonLayers}
        {redGeoJsonLayers}
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
        {/* <strong>Legend</strong>
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
              background: blueGeoJsonStyle.color,
              display: "inline-block",
              borderRadius: 3,
            }}
          />
          BLUE
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
              background: redGeoJsonStyle.color,
              display: "inline-block",
              borderRadius: 3,
            }}
          />
          RED
        </div> */}
      </div>
    </div>
  );
}
