import RadarMap from "./components/RadarMap";
import useRadarData from "./hooks/useRadarData";

function App() {
  const { time, blueSituationalPicture, redGroundTruth } = useRadarData();

  return (
    <>
      <RadarMap
        time={time}
        blueMonostaticRadars={blueSituationalPicture.friendly_radars}
        redTargetGroundTruths={redGroundTruth}
      />
    </>
  );
}

export default App;
