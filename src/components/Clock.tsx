export default function Clock({ time }: { time: Date }) {
  return (
    <span
      style={{
        alignContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {time.toLocaleDateString("gsw")}
      <br />
      <span style={{fontSize: "1.5em"}}>{time.toLocaleTimeString("gsw")}</span>
    </span>
  );
}
