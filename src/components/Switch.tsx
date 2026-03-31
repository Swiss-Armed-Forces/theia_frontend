import { useSettings } from "../hooks/useSettings";

export default function Switch({
  on,
  setOn,
}: {
  on: boolean;
  setOn: (on: boolean) => void;
}) {
  const {settings} = useSettings()

  return (
    <button
      onClick={() => setOn(!on)}
      style={{
        width: 50,
        height: 26,
        borderRadius: 13,
        border: "none",
        background: on ? settings.primary : "#ccc",
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
