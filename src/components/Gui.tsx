import { useState, type Dispatch, type SetStateAction } from "react";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RadarMap from "./RadarMap";
import SettingsForm from "./SettingsForm";
import { type Chip } from "./ChipList";
import TopBar from "./TopBar";
import "./Gui.css";
import useRadarData, {
  type GeoJSONAnnotation,
  type GroundTruth,
  type Track,
} from "../hooks/useRadarData";
import useGameData from "../hooks/useGameData";
import useEvents from "../hooks/useEvents";
import EventLog from "./EventLog";
import { useSettings } from "../hooks/useSettings";

function toggleKey(
  setKeys: Dispatch<SetStateAction<Set<string>>>,
  key: string,
) {
  setKeys((prev) => {
    const next = new Set(prev);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    return next;
  });
}

// Copy of `ids` with `keys` added (`add`) or removed.
function withKeys(ids: Set<string>, keys: string[], add: boolean): Set<string> {
  const next = new Set(ids);
  for (const key of keys) {
    if (add) {
      next.add(key);
    } else {
      next.delete(key);
    }
  }
  return next;
}

// The side panel toggles annotations by ID and labels them like the map.
function toChip(annotation: GeoJSONAnnotation): Chip {
  return { key: annotation.id, label: annotation.hover_text ?? annotation.id };
}

export default function Gui() {
  const { settings } = useSettings();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // Annotations are hidden until the user shows them.
  const [shownBlueIds, setShownBlueIds] = useState<Set<string>>(new Set());
  const [shownRedIds, setShownRedIds] = useState<Set<string>>(new Set());

  const {
    time,
    displayData,
    isPaused,
    setIsPaused,
    speedupFactor,
    setSpeedupFactor,
  } = useRadarData(settings.extrapolate);

  // The visible side; the GOD perspective shows both sides and cannot act.
  const team = settings.perspective === "GOD" ? null : settings.perspective;
  const gameData = useGameData(team, time);
  const { entries: eventLogEntries, addLocalEntry } = useEvents(time);

  const trajectories = displayData.redTargets.concat(displayData.blueTargets);

  // Attack targets: the enemy ground tracks of the visible side's
  // situational picture (no ground truth, so fog of war is respected).
  const enemyTrajectories: (Track | GroundTruth)[] =
    team === "BLUE"
      ? displayData.redTargets
      : team === "RED"
        ? displayData.blueTargets
        : [];
  const attackTargets = enemyTrajectories.filter(
    (trajectory): trajectory is Track =>
      "id" in trajectory && !trajectory.info.is_airborne,
  );

  // Clicking a unit toggles all its annotations: if all are shown, hide them;
  // otherwise show them. Only annotations of visible sides are displayed.
  const toggleTargetAnnotations = (targetId: number) => {
    const idsOf = (annotations: GeoJSONAnnotation[]) =>
      annotations
        .filter((annotation) => annotation.target_ids.includes(targetId))
        .map((annotation) => annotation.id);
    const blueIds = idsOf(displayData.blueGeoJson);
    const redIds = idsOf(displayData.redGeoJson);
    const allShown =
      blueIds.every((id) => shownBlueIds.has(id)) &&
      redIds.every((id) => shownRedIds.has(id));
    setShownBlueIds((prev) => withKeys(prev, blueIds, !allShown));
    setShownRedIds((prev) => withKeys(prev, redIds, !allShown));
  };

  const sidebarContent = (
    <SettingsForm
      blueGeoJsonChips={displayData.blueGeoJson.map(toChip)}
      redGeoJsonChips={displayData.redGeoJson.map(toChip)}
      shownBlueIds={shownBlueIds}
      shownRedIds={shownRedIds}
      onToggleBlue={(key) => toggleKey(setShownBlueIds, key)}
      onToggleRed={(key) => toggleKey(setShownRedIds, key)}
    />
  );

  return (
    <div className="app">
      <TopBar
        time={time}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        speedupFactor={speedupFactor}
        setSpeedupFactor={setSpeedupFactor}
        numberOfFriendlyRadars={displayData.blueRadars.length}
        numberOfEnemyTargets={displayData.redTargets.length}
      />

      <div className="content">
        {!isSidebarCollapsed && (
          <aside className="sidebar panel">{sidebarContent}</aside>
        )}
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? "Show panel" : "Hide panel"}
        >
          <FontAwesomeIcon
            icon={isSidebarCollapsed ? faChevronRight : faChevronLeft}
          />
        </button>
        <main className="main panel">
          <RadarMap
            resizeTrigger={isSidebarCollapsed}
            time={time}
            blueGeoJson={displayData.blueGeoJson}
            redGeoJson={displayData.redGeoJson}
            shownBlueIds={shownBlueIds}
            shownRedIds={shownRedIds}
            trajectories={trajectories}
            team={team}
            campSites={gameData.campSites}
            transportTimes={gameData.transportTimes}
            attackTargets={attackTargets}
            onActionFailed={(msg) => addLocalEntry(team, msg)}
            onTargetClick={toggleTargetAnnotations}
          />
          <EventLog
            entries={eventLogEntries}
            perspective={settings.perspective}
          />
        </main>
      </div>
    </div>
  );
}
