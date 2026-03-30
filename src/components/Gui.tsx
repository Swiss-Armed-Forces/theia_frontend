import type { Settings } from "../contexts/SettingsContext";
import type { GeoJSONFeature, GroundTruth, Radar, Track } from "../hooks/useRadarData";
import Clock from "./Clock";
import PlaybackControls from "./PlaybackControls";
import RadarMap from "./RadarMap";
import SettingsForm from "./SettingsForm";

export default function Gui({
  time,
  isPaused,
  setIsPaused,
  settings,
  setSettings,
  friendlyRadars,
  friendlyCoverages,
  enemyTrajectories,
}: {
  time: Date;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  friendlyRadars: Radar[];
  friendlyCoverages: GeoJSONFeature[];
  enemyTrajectories: GroundTruth[] | Track[];
}) {
  const topBar = (
    <div>
      <PlaybackControls isPaused={isPaused} setIsPaused={setIsPaused} />
      <Clock time={time} />
      <SettingsForm settings={settings} setSettings={setSettings} />
    </div>
  );

  const sideBar = <div></div>;

  const map = (
    <RadarMap
      time={time}
      blueMonostaticRadars={friendlyRadars}
      blueMonostaticCoverages={friendlyCoverages}
      redTrajectories={enemyTrajectories}
    />
  );
  return <>{topBar}{sideBar}{map}</>;
}
