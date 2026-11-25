import { useState, type Dispatch, type SetStateAction } from "react";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RadarMap from "./RadarMap";
import SettingsForm from "./SettingsForm";
import { type Chip } from "./ChipList";
import TopBar from "./TopBar";
import "./Gui.css";
import { arePointsEqual } from "../util/utils";
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
  setHidden: Dispatch<SetStateAction<Set<string>>>,
  key: string,
) {
  setHidden((prev) => {
    const next = new Set(prev);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    return next;
  });
}

// The side panel toggles annotations by ID and labels them like the map.
function toChip(annotation: GeoJSONAnnotation): Chip {
  return { key: annotation.id, label: annotation.hover_text ?? annotation.id };
}

export default function Gui() {
  const { settings } = useSettings();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hiddenBlueKeys, setHiddenBlueKeys] = useState<Set<string>>(
    new Set(),
  );
  const [hiddenRedKeys, setHiddenRedKeys] = useState<Set<string>>(new Set());

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

  const blueMonostaticRadars = displayData.blueRadars.filter((sensor) =>
    arePointsEqual(sensor.receiver.point, sensor.transmitter.point),
  );

  const bluePclSensors = displayData.blueRadars.filter(
    (sensor) =>
      !arePointsEqual(sensor.receiver.point, sensor.transmitter.point),
  );

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

  const sidebarContent = (
    <SettingsForm
      blueGeoJsonChips={displayData.blueGeoJson.map(toChip)}
      redGeoJsonChips={displayData.redGeoJson.map(toChip)}
      hiddenBlueKeys={hiddenBlueKeys}
      hiddenRedKeys={hiddenRedKeys}
      onToggleBlue={(key) => toggleKey(setHiddenBlueKeys, key)}
      onToggleRed={(key) => toggleKey(setHiddenRedKeys, key)}
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
            blueMonostaticRadars={blueMonostaticRadars}
            blueGeoJson={displayData.blueGeoJson}
            redGeoJson={displayData.redGeoJson}
            hiddenBlueKeys={hiddenBlueKeys}
            hiddenRedKeys={hiddenRedKeys}
            bluePclSensors={bluePclSensors}
            trajectories={trajectories}
            team={team}
            campSites={gameData.campSites}
            transportTimes={gameData.transportTimes}
            attackTargets={attackTargets}
            onActionFailed={(msg) => addLocalEntry(team, msg)}
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
