import RadarMap from "./components/RadarMap";
import useRadarData from "./hooks/useRadarData";

function App() {
  const { time, blueSituationalPicture, redGroundTruth, blueCoverages } =
    useRadarData();

  return (
    <>
      <RadarMap
        time={time}
        blueMonostaticRadars={blueSituationalPicture.friendly_radars}
        blueMonostaticCoverages={blueCoverages}
        redTargetGroundTruths={redGroundTruth}
      />
    </>
  );
}

export default App;
