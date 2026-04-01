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
}: {
  time: Date;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
  speedupFactor: number;
  setSpeedupFactor: (factor: number) => void;
  numberOfFriendlyRadars: number;
  numberOfEnemyTargets: number;
}) {
  return (
    <div
      className={"panel"}
      style={{
        alignItems: "center",
        display: "flex",
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
