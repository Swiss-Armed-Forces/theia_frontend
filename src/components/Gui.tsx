import RadarMap from "./RadarMap";
import SettingsForm from "./SettingsForm";
import TopBar from "./TopBar";
import "./Gui.css";
import { arePointsEqual } from "../util/utils";
import useRadarData from "../hooks/useRadarData";
import { useSettings } from "../hooks/useSettings";

export default function Gui() {
  const sidebarContent = <SettingsForm />;
  const { settings } = useSettings();

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
        <aside className="sidebar panel">{sidebarContent}</aside>
        <main className="main panel">
          <RadarMap
            time={time}
            blueMonostaticRadars={blueMonostaticRadars}
            blueTrackInitCoverages={displayData.blueTrackInitCoverages}
            blueTrackUpdateCoverages={displayData.blueTrackUpdateCoverages}
            redTrackInitCoverages={displayData.redTrackInitCoverages}
            redTrackUpdateCoverages={displayData.redTrackUpdateCoverages}
            bluePclSensors={bluePclSensors}
            trajectories={trajectories}
          />
        </main>
      </div>
    </div>
  );
}
