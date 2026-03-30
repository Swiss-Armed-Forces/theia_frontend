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
    blueCoverages,
    isPaused,
    setIsPaused,
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
        friendlyCoverages={blueCoverages}
        enemyTrajectories={
          settings.displayGroundTruth
            ? redGroundTruth
            : blueSituationalPicture.enemy_tracks
        }
      />
    </>
  );
}

export default App;
