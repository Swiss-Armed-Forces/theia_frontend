import type { Settings } from "../contexts/SettingsContext";
import type {
  GeoJSONFeature,
  GroundTruth,
  Radar,
  Track,
} from "../hooks/useRadarData";
import RadarMap from "./RadarMap";
import SettingsForm from "./SettingsForm";
import TopBar from "./TopBar";
import "./Gui.css";

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
  friendlyRadars: Radar[];
  friendlyCoverages: GeoJSONFeature[];
  enemyTrajectories: GroundTruth[] | Track[];
  speedupFactor: number;
  setSpeedupFactor: (n: number) => void;
}) {
  const sidebarContent = (
    <SettingsForm settings={settings} setSettings={setSettings} />
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
            blueMonostaticRadars={friendlyRadars}
            blueMonostaticCoverages={friendlyCoverages}
            redTrajectories={enemyTrajectories}
          />
        </main>
      </div>
    </div>
  );
}
