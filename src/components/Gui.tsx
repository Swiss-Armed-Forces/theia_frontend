import { useState, type Dispatch, type SetStateAction } from "react";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RadarMap from "./RadarMap";
import SettingsForm from "./SettingsForm";
import TopBar from "./TopBar";
import "./Gui.css";
import { arePointsEqual } from "../util/utils";
import useRadarData from "../hooks/useRadarData";
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

  const blueMonostaticRadars = displayData.blueRadars.filter((sensor) =>
    arePointsEqual(sensor.receiver.point, sensor.transmitter.point),
  );

  const bluePclSensors = displayData.blueRadars.filter(
    (sensor) =>
      !arePointsEqual(sensor.receiver.point, sensor.transmitter.point),
  );

  const trajectories = displayData.redTargets.concat(displayData.blueTargets);

  const sidebarContent = (
    <SettingsForm
      blueGeoJsonKeys={Object.keys(displayData.blueGeoJson)}
      redGeoJsonKeys={Object.keys(displayData.redGeoJson)}
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
          />
        </main>
      </div>
    </div>
  );
}
