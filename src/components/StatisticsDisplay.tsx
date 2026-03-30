import { useSettings } from "../hooks/useSettings";
import ms from "milsymbol";
import RadarIcon from "../icons/RadarIcon";

export default function StatisticsDisplay({
  numberOfFriendlyRadars,
  numberOfEnemyTargets,
}: {
  numberOfFriendlyRadars: number;
  numberOfEnemyTargets: number;
}) {
  //   const { settings } = useSettings();
  //   return (
  //     <span
  //       style={{
  //         backgroundColor: settings.natoBlue,
  //         minHeight: "100%",
  //         display: "inline-block",
  //         fontSize: "2em",
  //         color: "black"
  //       }}
  //     >
  //       {" "}
  //       {RadarIcon()}
  //       {numberOfFriendlyRadars}
  //     </span>
  //   );
  return (
    <span>
      No. BLUE Radars: {numberOfFriendlyRadars} | No. RED targets:{" "}
      {numberOfEnemyTargets}
    </span>
  );
}
