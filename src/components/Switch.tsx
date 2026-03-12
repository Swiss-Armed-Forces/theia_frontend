export default function Switch({
  on,
  setOn,
}: {
  on: boolean;
  setOn: (on: boolean) => void;
}) {
  return (
    <button
      onClick={() => setOn(!on)}
      style={{
        width: 50,
        height: 26,
        borderRadius: 13,
        border: "none",
        background: on ? "#4caf50" : "#ccc",
        position: "relative",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 26 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "white",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}
