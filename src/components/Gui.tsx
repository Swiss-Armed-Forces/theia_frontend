import type { Settings } from "../contexts/SettingsContext";
import type {
  GeoJSONFeature,
  GroundTruth,
  Radar,
  Track,
} from "../hooks/useRadarData";
import Clock from "./Clock";
import PlaybackControls from "./PlaybackControls";
import RadarMap from "./RadarMap";
import SettingsForm from "./SettingsForm";
import StatisticsDisplay from "./StatisticsDisplay";

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
  const panelSettings = {
    backgroundColor: settings.panelBackground,
    margin: "10px",
    border: "solid",
    borderColor: settings.borderColor,
    borderRadius: 10,
    padding: "10px",
  };
  const sidebarContent = (
    <SettingsForm settings={settings} setSettings={setSettings} />
  );

  const topBar = (
    <div
      style={{
        height: "4vh",
        alignItems: "center",
        display: "flex",
        ...panelSettings,
      }}
    >
      <PlaybackControls isPaused={isPaused} setIsPaused={setIsPaused} />
      <div style={{ flex: 1, textAlign: "center" }}></div>
      <Clock time={time} />
      <div style={{ flex: 1, textAlign: "center" }}></div>
      <StatisticsDisplay numberOfFriendlyRadars={friendlyRadars.length} numberOfEnemyTargets={enemyTrajectories.length} />
    </div>
  );

  const sideBar = (
    <span
      style={{
        minWidth: "14vw",
        minHeight: "86vh",
        display: "inline-block",
        ...panelSettings,
        marginTop: 0,
      }}
    >
      {sidebarContent}
    </span>
  );

  return (
    <div
      style={{
        backgroundColor: settings.primaryBackground,
        color: settings.textColor,
        minWidth: "100vw",
        minHeight: "99vh",
        margin: 0,
        padding: 0,
        paddingTop: "10px"
      }}
    >
      {topBar}
      {sideBar}
      <span
        style={{
          minWidth: "80vw",
          minHeight: "85vh",
          display: "inline-block",
          position: "absolute",
          ...panelSettings,
          marginTop: 0,
        }}
      >
        <RadarMap
          time={time}
          blueMonostaticRadars={friendlyRadars}
          blueMonostaticCoverages={friendlyCoverages}
          redTrajectories={enemyTrajectories}
        />
      </span>
    </div>
  );
}
