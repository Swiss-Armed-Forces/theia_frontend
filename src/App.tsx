import { useState } from "react";
import RadarMap from "./components/RadarMap";
import useRadarData from "./hooks/useRadarData";
import PlaybackControls from "./components/PlaybackControls";
import { defaultSettings } from "./contexts/SettingsContext";
import SettingsForm from "./components/SettingsForm";

function App() {
  const [settings, setSettings] = useState(defaultSettings);

  const {
    time,
    blueSituationalPicture,
    redGroundTruth,
    blueCoverages,
    isPaused,
    setIsPaused,
  } = useRadarData(settings.extrapolate);

  return (
    <>
      <div style={{}}>
        Time: {time.toISOString()}{" "}
        <SettingsForm settings={settings} setSettings={setSettings} />
        <PlaybackControls isPaused={isPaused} setIsPaused={setIsPaused} />
      </div>
      
      <RadarMap
        time={time}
        blueMonostaticRadars={blueSituationalPicture.friendly_radars}
        blueMonostaticCoverages={blueCoverages}
        redTargetGroundTruths={redGroundTruth}
        redTrajectories={
          settings.displayGroundTruth
            ? redGroundTruth
            : blueSituationalPicture.enemy_tracks
        }
      />
    </>
  );
}

export default App;
