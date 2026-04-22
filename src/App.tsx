import { useState } from "react";
import useRadarData from "./hooks/useRadarData";
import { defaultSettings } from "./contexts/SettingsContext";
import Gui from "./components/Gui";

function App() {
  const [settings, setSettings] = useState(defaultSettings);

  const {
    time,
    blueSituationalPicture,
    redGroundTruth,
    blueTrackInitCoverages,
    blueTrackUpdateCoverages,
    isPaused,
    setIsPaused,
    speedupFactor,
    setSpeedupFactor,
  } = useRadarData(settings.extrapolate);

  return (
    <>
      <Gui
        time={time}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        settings={settings}
        setSettings={setSettings}
        friendlyRadars={blueSituationalPicture.friendly_radars}
        friendlyTrackInitCoverages={blueTrackInitCoverages}
        friendlyTrackUpdateCoverages={blueTrackUpdateCoverages}
        enemyTrajectories={
          settings.displayGroundTruth
            ? redGroundTruth
            : blueSituationalPicture.enemy_tracks
        }
        speedupFactor={speedupFactor}
        setSpeedupFactor={setSpeedupFactor}
      />
    </>
  );
}

export default App;
