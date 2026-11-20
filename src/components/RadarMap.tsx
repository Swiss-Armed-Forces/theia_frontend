import L from "leaflet";
import type {
  GeoJSONFeature,
  GroundTruth,
  Sensor,
  Team,
  Track,
} from "../hooks/useRadarData";
import type { CampSiteState } from "../hooks/useGameData";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MonostaticRadarMarker, PclSensorMarkers } from "./RadarMarker";
import TrajectoryLayer from "./TrajectoryLayer";
import CampSiteMarker from "./CampSiteMarker";
import ClickPopup from "./ClickPopup";
import GeoJsonLayer from "./GeoJsonLayer";
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
  trajectories: allTrajectories,
  team,
  campSites,
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
  /** Visible side; `null` in the GOD perspective */
  team: Team | null;
  /** Own camp sites; only present if the visible side is user-controlled */
  campSites: CampSiteState[];
  resizeTrigger?: boolean;
}) {
  const { settings } = useSettings();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  useEffect(() => {
    if (containerRef.current && !mapInstanceRef.current) {
      const instance = L.map(containerRef.current).setView(
        [47.374444, 8.541111],
        9,
      );
      mapInstanceRef.current = instance;
      setMap(instance);
    }
    return () => {
      const instance = mapInstanceRef.current;
      if (instance) {
        instance.remove();
        mapInstanceRef.current = null;
        setMap(null);
      }
    };
  }, []);

  useEffect(() => {
    map?.invalidateSize();
  }, [map, resizeTrigger]);

  useEffect(() => {
    if (!map) return;
    const tileLayer = L.tileLayer(settings.tileServerConfig.url, {
      attribution: settings.tileServerConfig.attribution,
      subdomains: ["a", "b", "c"],
    });
    tileLayer.addTo(map);
    return () => {
      tileLayer.remove();
    };
  }, [map, settings.tileServerConfig.url, settings.tileServerConfig.attribution]);

  // Camp sites are drawn by their own markers: drop their ground truth.
  const campSiteTargetIds = new Set(campSites.map((site) => site.target_id));
  const trajectories = allTrajectories.filter(
    (trajectory) =>
      !("target_id" in trajectory) ||
      !campSiteTargetIds.has(trajectory.target_id),
  );

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
      map={map}
      radar={radar}
      onClick={function (): void {
        throw new Error("Function not implemented.");
      }}
    />
  ));
  const campSiteMarkers =
    team === null
      ? []
      : campSites.map((site) => (
          <CampSiteMarker key={site.id} map={map} site={site} team={team} />
        ));
  const pclSensorMarkers = bluePclSensors.map((sensor, i) => (
    <PclSensorMarkers key={i} map={map} sensor={sensor} />
  ));
  const groundTruthLayers = visibleTrajectories.map((trajectory) => (
    <TrajectoryLayer
      key={
        "id" in trajectory
          ? `TRACK ${trajectory.id}`
          : `TRUTH ${trajectory.target_id}`
      }
      map={map}
      trajectory={trajectory}
    />
  ));

  const blueGeoJsonStyle = { color: BLUE_GEOJSON_COLOR, fillOpacity: 0.3 };
  const redGeoJsonStyle = { color: RED_GEOJSON_COLOR, fillOpacity: 0.3 };

  const blueGeoJsonLayers = Object.entries(blueGeoJson)
    .filter(([key]) => !hiddenBlueKeys.has(key))
    .map(([key, feature]) => (
      <GeoJsonLayer
        key={key}
        map={map}
        data={feature}
        style={blueGeoJsonStyle}
        tooltipLabel={key}
      />
    ));
  const redGeoJsonLayers = Object.entries(redGeoJson)
    .filter(([key]) => !hiddenRedKeys.has(key))
    .map(([key, feature]) => (
      <GeoJsonLayer
        key={key}
        map={map}
        data={feature}
        style={redGeoJsonStyle}
        tooltipLabel={key}
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
      <div
        ref={containerRef}
        style={{
          height: "100%",
          width: "100%",
          flex: 18,
        }}
      />
      {blueGeoJsonLayers}
      {redGeoJsonLayers}
      {monostaticRadarMarkers}
      {pclSensorMarkers}
      {groundTruthLayers}
      {campSiteMarkers}
      <ClickPopup map={map} />
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
