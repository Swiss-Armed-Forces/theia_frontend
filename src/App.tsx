import RadarMap from "./components/RadarMap";
import useRadarData from "./hooks/useRadarData";

function App() {
  const { time, blueSituationalPicture } = useRadarData();

  return (
    <>
      <RadarMap time={time} blueMonostaticRadars={blueSituationalPicture.friendly_radars} />
    </>
  );
}

export default App;
