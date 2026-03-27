import { useState } from "react";
import RadarMap from "./components/RadarMap";
import useRadarData from "./hooks/useRadarData";
import Switch from "./components/Switch";
import PlaybackControls from "./components/PlaybackControls";

function App() {
  const [displayGroundTruth, setDisplayGroundTruth] = useState(true);
  const [extrapolate, setExtrapolate] = useState(true);

  const {
    time,
    blueSituationalPicture,
    redGroundTruth,
    blueCoverages,
    isPaused,
    setIsPaused,
  } = useRadarData(extrapolate);

  return (
    <>
      <div style={{}}>
        Time: {time.toISOString()}{" "}
        <Switch on={displayGroundTruth} setOn={setDisplayGroundTruth} />
        Ground Truth?
        <Switch on={extrapolate} setOn={setExtrapolate} />
        Extrapolate?
      </div>
      <PlaybackControls isPaused={isPaused} setIsPaused={setIsPaused} />
      <RadarMap
        time={time}
        blueMonostaticRadars={blueSituationalPicture.friendly_radars}
        blueMonostaticCoverages={blueCoverages}
        redTargetGroundTruths={redGroundTruth}
        redTrajectories={
          displayGroundTruth
            ? redGroundTruth
            : blueSituationalPicture.enemy_tracks
        }
      />
    </>
  );
}

export default App;
