import type { Settings } from "../contexts/SettingsContext";
import type {
  GeoJSONFeature,
  GroundTruth,
  Sensor,
  Track,
} from "../hooks/useRadarData";
import RadarMap from "./RadarMap";
import SettingsForm from "./SettingsForm";
import TopBar from "./TopBar";
import "./Gui.css";
import { arePointsEqual } from "../util/utils";

export default function Gui({
  time,
  isPaused,
  setIsPaused,
  settings,
  setSettings,
  friendlyRadars,
  friendlyCoverages,
  enemyTrajectories,
  speedupFactor,
  setSpeedupFactor,
}: {
  time: Date;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  friendlyRadars: Sensor[];
  friendlyCoverages: GeoJSONFeature[];
  enemyTrajectories: GroundTruth[] | Track[];
  speedupFactor: number;
  setSpeedupFactor: (n: number) => void;
}) {
  const sidebarContent = (
    <SettingsForm settings={settings} setSettings={setSettings} />
  );

  const friendlyMonostaticRadars = friendlyRadars.filter((sensor) =>
    arePointsEqual(sensor.receiver.point, sensor.transmitter.point),
  );

  const friendlyPclSensors = friendlyRadars.filter(
    (sensor) =>
      !arePointsEqual(sensor.receiver.point, sensor.transmitter.point),
  );

  return (
    <div className="app">
      <TopBar
        time={time}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        speedupFactor={speedupFactor}
        setSpeedupFactor={setSpeedupFactor}
        numberOfFriendlyRadars={friendlyRadars.length}
        numberOfEnemyTargets={enemyTrajectories.length}
      />

      <div className="content">
        <aside className="sidebar panel">{sidebarContent}</aside>
        <main className="main panel">
          <RadarMap
            time={time}
            blueMonostaticRadars={friendlyMonostaticRadars}
            blueMonostaticCoverages={friendlyCoverages}
            bluePclSensors={friendlyPclSensors}
            redTrajectories={enemyTrajectories}
          />
        </main>
      </div>
    </div>
  );
}
