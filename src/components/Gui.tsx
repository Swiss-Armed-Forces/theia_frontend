import type { Perspective, Settings } from "../contexts/SettingsContext";
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
  blueRadars,
  blueTrackInitCoverages,
  blueTrackUpdateCoverages,
  blueTrajectories,
  redTrajectories,
  speedupFactor,
  setSpeedupFactor,
}: {
  time: Date;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
  blueRadars: Sensor[];
  blueTrackInitCoverages: GeoJSONFeature[];
  blueTrackUpdateCoverages: GeoJSONFeature[];
  blueTrajectories: GroundTruth[] | Track[];
  redTrajectories: GroundTruth[] | Track[];
  speedupFactor: number;
  setSpeedupFactor: (n: number) => void;
  perspective: Perspective;
}) {
  const sidebarContent = (
    <SettingsForm settings={settings} setSettings={setSettings} />
  );

  const blueMonostaticRadars = blueRadars.filter((sensor) =>
    arePointsEqual(sensor.receiver.point, sensor.transmitter.point),
  );

  const bluePclSensors = blueRadars.filter(
    (sensor) =>
      !arePointsEqual(sensor.receiver.point, sensor.transmitter.point),
  );

  // TODO
  const trajectories = redTrajectories.concat(blueTrajectories) as (GroundTruth | Track)[];
  console.log("Trajcetories", redTrajectories, blueTrajectories, trajectories)

  return (
    <div className="app">
      <TopBar
        time={time}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        speedupFactor={speedupFactor}
        setSpeedupFactor={setSpeedupFactor}
        numberOfFriendlyRadars={blueRadars.length}
        numberOfEnemyTargets={redTrajectories.length}
      />

      <div className="content">
        <aside className="sidebar panel">{sidebarContent}</aside>
        <main className="main panel">
          <RadarMap
            settings={settings}
            time={time}
            blueMonostaticRadars={blueMonostaticRadars}
            blueTrackInitCoverages={blueTrackInitCoverages}
            blueTrackUpdateCoverages={blueTrackUpdateCoverages}
            bluePclSensors={bluePclSensors}
            trajectories={trajectories}
          />
        </main>
      </div>
    </div>
  );
}
