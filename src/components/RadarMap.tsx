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
import { useSettings } from "../contexts/SettingsContext";
import type { LineString } from "geojson";

export default function RadarMap({
  time,
  blueMonostaticRadars,
  bluePclSensors,
  blueTrackInitCoverages,
  blueTrackUpdateCoverages,
  redTrackInitCoverages,
  redTrackUpdateCoverages,
  trajectories,
}: {
  time: Date;
  blueMonostaticRadars: Sensor[];
  bluePclSensors: Sensor[];
  blueTrackInitCoverages: GeoJSONFeature[];
  blueTrackUpdateCoverages: GeoJSONFeature[];
  redTrackInitCoverages: GeoJSONFeature[];
  redTrackUpdateCoverages: GeoJSONFeature[];
  trajectories: (GroundTruth | Track)[];
}) {
  const { settings } = useSettings();
  const mapRef = useRef(null as Map | null);
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
      key={"id" in trajectory ? parseInt(trajectory.id) : trajectory.target_id}
      trajectory={trajectory}
      currentTime={time}
      isBlue={false}
    />
  ));

  const blueInitStyle = { color: "#1789FC", fillOpacity: 0.3 };
  const blueUpdateStyle = {
    color: "blue",
    dashArray: "5, 5",
    fillOpacity: 0.2,
  };
  const redInitStyle = { color: "#f2a202", fillOpacity: 0.3 };
  const redUpdateStyle = { color: "red", dashArray: "5, 5", fillOpacity: 0.2 };

  const blueTrackInitCoverageLayers = blueTrackInitCoverages.map(
    (coverage, i) => (
      <GeoJSON
        key={i}
        data={coverage}
        interactive={false}
        style={blueInitStyle}
      />
    ),
  );
  const blueTrackUpdateCoverageLayers = blueTrackUpdateCoverages.map(
    (coverage, i) => (
      <GeoJSON
        key={i}
        data={coverage}
        interactive={false}
        style={blueUpdateStyle}
      />
    ),
  );
  const redTrackUpdateCoverageLayers = redTrackUpdateCoverages.map(
    (coverage, i) => (
      <GeoJSON
        key={i}
        data={coverage}
        interactive={false}
        style={redUpdateStyle}
      />
    ),
  );
  const redTrackInitCoverageLayers = redTrackInitCoverages.map(
    (coverage, i) => (
      <GeoJSON
        key={i}
        data={coverage}
        interactive={false}
        style={redInitStyle}
      />
    ),
  );

  const calcGridLayer = (
    <GeoJSON
      data={
        {
          type: "LineString",
          coordinates: [
            [settings.pclCalcGrid.lon_start, settings.pclCalcGrid.lat_start],
            [settings.pclCalcGrid.lon_stop, settings.pclCalcGrid.lat_start],
            [settings.pclCalcGrid.lon_stop, settings.pclCalcGrid.lat_stop],
            [settings.pclCalcGrid.lon_start, settings.pclCalcGrid.lat_stop],
            [settings.pclCalcGrid.lon_start, settings.pclCalcGrid.lat_start],
          ],
        } as LineString
      }
      interactive={false}
      style={{
        color: "black",
        weight: 2,
        dashArray: "6 4",
        fill: false,
      }}
    />
  );

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
        {blueTrackUpdateCoverageLayers}
        {blueTrackInitCoverageLayers}
        {redTrackUpdateCoverageLayers}
        {redTrackInitCoverageLayers}
        {monostaticRadarMarkers}
        {pclSensorMarkers}
        {groundTruthLayers}
        {calcGridLayer}
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
              background: blueInitStyle.color,
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
              background: blueUpdateStyle.color,
              strokeDasharray: blueUpdateStyle.dashArray,
              strokeWidth: 2,
              display: "inline-block",
              borderRadius: 3,
            }}
          />
          Track Update coverage
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
              background: redInitStyle.color,
              display: "inline-block",
              borderRadius: 3,
            }}
          />
          RED Track Init coverage
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
              background: redUpdateStyle.color,
              strokeDasharray: redUpdateStyle.dashArray,
              strokeWidth: 2,
              display: "inline-block",
              borderRadius: 3,
            }}
          />
          RED Track Update coverage
        </div>
      </div>
    </div>
  );
}
