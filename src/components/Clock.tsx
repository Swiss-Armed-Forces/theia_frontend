export default function Clock({ time }: { time: Date }) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <span
      style={{
        alignContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {`${time.getUTCFullYear()}-${pad(time.getUTCMonth() + 1)}-${pad(time.getUTCDate())}`}
      <br />
      <span style={{ fontSize: "1.5em" }}>
        {`${pad(time.getUTCHours())}:${pad(time.getUTCMinutes())}:${pad(time.getUTCSeconds())}`}
      </span>
    </span>
  );
}
