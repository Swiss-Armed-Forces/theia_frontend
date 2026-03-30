export default function Clock({ time }: { time: Date }) {
  return <span>Time: {time.toISOString()} </span>;
}
