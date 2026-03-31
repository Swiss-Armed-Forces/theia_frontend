import { useSettings } from "../hooks/useSettings";
import ButtonGroup from "./ButtonGroup";
import Clock from "./Clock";
import PlaybackControls from "./PlaybackControls";
import StatisticsDisplay from "./StatisticsDisplay";

export default function TopBar({
  time,
  isPaused,
  setIsPaused,
  speedupFactor,
  setSpeedupFactor,
  numberOfFriendlyRadars,
  numberOfEnemyTargets,
  height,
}: {
  time: Date;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  speedupFactor: number;
  setSpeedupFactor: (factor: number) => void;
  numberOfFriendlyRadars: number;
  numberOfEnemyTargets: number;
  height: string | number;
}) {
  const { settings } = useSettings();

  return (
    <div
      style={{
        height: height,
        alignItems: "center",
        display: "flex",
        backgroundColor: settings.panelBackground,
        margin: "10px",
        border: "solid",
        borderColor: settings.borderColor,
        borderRadius: 10,
        padding: "10px",
      }}
    >
      <PlaybackControls isPaused={isPaused} setIsPaused={setIsPaused} />
      <div style={{ display: "inline-block", minWidth: "2em" }} />
      <ButtonGroup
        options={[1, 2, 10, 20, 40].map((n) => `${n}x`)}
        value={`${speedupFactor}x`}
        onChange={function (value: string): void {
          const n = parseInt(value.replace("x", ""));
          setSpeedupFactor(n);
        }}
      />
      <div style={{ flex: 1, textAlign: "center" }}></div>
      <Clock time={time} />
      <div style={{ flex: 1, textAlign: "center" }}></div>
      <StatisticsDisplay
        numberOfFriendlyRadars={numberOfFriendlyRadars}
        numberOfEnemyTargets={numberOfEnemyTargets}
      />
    </div>
  );
}
