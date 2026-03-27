import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PlaybackControls({
  isPaused,
  setIsPaused,
}: {
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
}) {
  return (
    <button
      style={{ minHeight: "100%", minWidth: "5em" }}
      onClick={() => setIsPaused(!isPaused)}
    >
      <FontAwesomeIcon icon={isPaused ? faPlay : faPause} />
    </button>
  );
}
