import { useState } from "react";
import useRadarData from "./hooks/useRadarData";
import Gui from "./components/Gui";
import { defaultSettings } from "./contexts/constants";

function App() {
  const [settings, setSettings] = useState(defaultSettings);

  const {
    time,
    blueSituationalPicture,
    redSituationalPicture,
    redGroundTruth,
    blueTrackInitCoverages,
    blueTrackUpdateCoverages,
    blueGroundTruth,
    isPaused,
    setIsPaused,
    speedupFactor,
    setSpeedupFactor,
  } = useRadarData(settings.extrapolate);

  let redTrajectories = [];
  if (settings.perspective === "BLUE") {
    redTrajectories = blueSituationalPicture.enemy_tracks;
  } else if (["RED", "GOD"].includes(settings.perspective)) {
    redTrajectories = redGroundTruth;
  } else {
    throw new Error("This part should never be reached!");
  }

  let blueTrajectories = [];
  if (settings.perspective === "RED") {
    blueTrajectories = redSituationalPicture.enemy_tracks;
  } else if (["BLUE", "GOD"].includes(settings.perspective)) {
    blueTrajectories = blueGroundTruth;
  } else {
    throw new Error("This part should never be reached!");
  }

  return (
    <>
      <Gui
        time={time}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        settings={settings}
        setSettings={setSettings}
        // TODO: Fill in RED perspective!
        blueRadars={
          ["BLUE", "GOD"].includes(settings.perspective)
            ? blueSituationalPicture.friendly_radars
            : []
        }
        blueTrackInitCoverages={
          ["BLUE", "GOD"].includes(settings.perspective)
            ? blueTrackInitCoverages
            : []
        }
        blueTrackUpdateCoverages={
          ["BLUE", "GOD"].includes(settings.perspective)
            ? blueTrackUpdateCoverages
            : []
        }
        blueTrajectories={blueTrajectories}
        redTrajectories={redTrajectories}
        speedupFactor={speedupFactor}
        setSpeedupFactor={setSpeedupFactor}
        perspective={"BLUE"}
      />
    </>
  );
}

export default App;
