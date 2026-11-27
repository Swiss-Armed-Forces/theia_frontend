import L from "leaflet";
import type {
  GeoJSONAnnotation,
  GroundTruth,
  Point,
  Team,
  Track,
} from "../hooks/useRadarData";
import {
  postAction,
  type CampSiteState,
  type RadarState,
  type TransportTime,
} from "../hooks/useGameData";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import TrajectoryLayer from "./TrajectoryLayer";
import PlayerActionsLayer, { type ActionMode } from "./PlayerActionsLayer";
import ClickPopup from "./ClickPopup";
import DistanceMeasurementLayer from "./DistanceMeasurementLayer";
import GeoJsonLayer from "./GeoJsonLayer";
import { extractState } from "../util/utils";
import IntervalSelector from "./IntervalSelector";
import { useSettings } from "../hooks/useSettings";
import { BLUE_GEOJSON_COLOR, RED_GEOJSON_COLOR } from "../contexts/constants";

export default function RadarMap({
  time,
  blueGeoJson,
  redGeoJson,
  shownBlueIds,
  shownRedIds,
  trajectories: allTrajectories,
  team,
  campSites,
  transportTimes,
  radars,
  attackTargets,
  onActionFailed,
  onTargetClick,
  resizeTrigger,
}: {
  time: Date;
  blueGeoJson: GeoJSONAnnotation[];
  redGeoJson: GeoJSONAnnotation[];
  shownBlueIds: Set<string>;
  shownRedIds: Set<string>;
  trajectories: (GroundTruth | Track)[];
  /** Visible side; `null` in the GOD perspective */
  team: Team | null;
  /** Own camp sites; only present if the visible side is user-controlled */
  campSites: CampSiteState[];
  /** Own transport routes; only present if the side is user-controlled */
  transportTimes: TransportTime[];
  /** Own switchable radars; only present if the side is user-controlled */
  radars: RadarState[];
  /** Enemy tracks the visible side can attack */
  attackTargets: Track[];
  /** Called with a message if an action could not be sent */
  onActionFailed: (msg: string) => void;
  /** Called when the icon of a target with annotations is clicked */
  onTargetClick: (targetId: number) => void;
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

  // Action the player has started and whose target is being picked. Reset
  // when the perspective changes; only valid while its camp site is alive.
  const [actionMode, setActionMode] = useState<ActionMode | null>(null);
  const [actionModeTeam, setActionModeTeam] = useState(team);
  if (team !== actionModeTeam) {
    setActionModeTeam(team);
    setActionMode(null);
  }
  const activeActionMode =
    actionMode !== null &&
    campSites.some((site) => site.id === actionMode.siteId && site.is_alive)
      ? actionMode
      : null;

  // Points of the distance measurement; empty when inactive.
  const [distancePoints, setDistancePoints] = useState<Point[]>([]);

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

  // Only ground truth (i. e. friendly units) is tied to annotations.
  const annotatedTargetIds = new Set(
    [...blueGeoJson, ...redGeoJson].flatMap(
      (annotation) => annotation.target_ids,
    ),
  );

  // A right-click on an own radar switches it on or off.
  const radarsByTargetId = new Map(
    radars.map((radar) => [radar.target_id, radar]),
  );
  const toggleRadar = (radar: RadarState) => {
    if (team === null) return;
    // A rejected action (`false`) is reported by the backend as an event.
    postAction(team, {
      type: "toggle_monostatic_radar",
      sensor_id: radar.sensor_id,
      new_is_on: !radar.is_on,
    }).catch((error: unknown) => {
      console.error(error);
      onActionFailed(
        `[ACTION ${team}] could not be sent: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
  };

  const groundTruthLayers = visibleTrajectories.map((trajectory) => {
    const radar =
      "target_id" in trajectory
        ? radarsByTargetId.get(trajectory.target_id)
        : undefined;
    return (
      <TrajectoryLayer
        key={
          "id" in trajectory
            ? `TRACK ${trajectory.id}`
            : `TRUTH ${trajectory.target_id}`
        }
        map={map}
        trajectory={trajectory}
        isDeactivated={radar !== undefined && !radar.is_on}
        onClick={
          "target_id" in trajectory &&
          annotatedTargetIds.has(trajectory.target_id)
            ? () => onTargetClick(trajectory.target_id)
            : undefined
        }
        onContextMenu={
          // Not while picking an action's target: there, a right-click cancels.
          radar !== undefined && activeActionMode === null
            ? () => toggleRadar(radar)
            : undefined
        }
      />
    );
  });

  const blueGeoJsonStyle = { color: BLUE_GEOJSON_COLOR, fillOpacity: 0.3 };
  const redGeoJsonStyle = { color: RED_GEOJSON_COLOR, fillOpacity: 0.3 };

  const geoJsonLayers = (
    annotations: GeoJSONAnnotation[],
    shownIds: Set<string>,
    style: L.PathOptions,
  ) =>
    annotations
      .filter((annotation) => shownIds.has(annotation.id))
      .map((annotation) => (
        <GeoJsonLayer
          key={annotation.id}
          map={map}
          data={annotation.feature}
          style={style}
          tooltipLabel={annotation.hover_text ?? annotation.id}
        />
      ));
  const blueGeoJsonLayers = geoJsonLayers(
    blueGeoJson,
    shownBlueIds,
    blueGeoJsonStyle,
  );
  const redGeoJsonLayers = geoJsonLayers(
    redGeoJson,
    shownRedIds,
    redGeoJsonStyle,
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
      {groundTruthLayers}
      {team !== null && (
        <PlayerActionsLayer
          key={team}
          map={map}
          team={team}
          campSites={campSites}
          transportTimes={transportTimes}
          attackTargets={attackTargets}
          onActionFailed={onActionFailed}
          actionMode={activeActionMode}
          onActionModeChange={setActionMode}
        />
      )}
      <DistanceMeasurementLayer
        map={map}
        points={distancePoints}
        onPointsChange={setDistancePoints}
        enabled={activeActionMode === null}
      />
      {/* A plain click while measuring only removes the measurement. */}
      <ClickPopup
        map={map}
        enabled={activeActionMode === null && distancePoints.length === 0}
      />
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
