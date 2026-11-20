import { useEffect, useRef, useState } from "react";
import { faChevronDown, faMessage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Perspective } from "../contexts/SettingsContext";
import type { LogEntry } from "../hooks/useEvents";
import { BLUE_GEOJSON_COLOR, RED_GEOJSON_COLOR } from "../contexts/constants";

const PARTY_COLORS: Partial<Record<string, string>> = {
  BLUE: BLUE_GEOJSON_COLOR,
  RED: RED_GEOJSON_COLOR,
};

// Whether the list is scrolled (almost) to its end [px]
const AT_END_TOLERANCE = 24;

function formatTime(time: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(time.getUTCHours())}:${pad(time.getUTCMinutes())}:${pad(time.getUTCSeconds())}`;
}

/** Entries of the log of a perspective: GOD sees all of them. */
function visibleEntries(entries: LogEntry[], perspective: Perspective) {
  return perspective === "GOD"
    ? entries
    : entries.filter((entry) => entry.party === perspective);
}

const NO_READ_KEYS: Record<Perspective, ReadonlySet<string>> = {
  BLUE: new Set(),
  RED: new Set(),
  GOD: new Set(),
};

/**
 * Collapsible event log of the current perspective.
 *
 * Each perspective has its own log (BLUE: party BLUE, RED: party RED, GOD:
 * all events) and its own read status. Collapsed, a badge shows the number of
 * unread entries, and the icon pulses when a new entry arrives. Expanded, all
 * entries of the log are read.
 */
export default function EventLog({
  entries,
  perspective,
}: {
  entries: LogEntry[];
  perspective: Perspective;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [readKeys, setReadKeys] = useState(NO_READ_KEYS);
  const visible = visibleEntries(entries, perspective);
  const read = readKeys[perspective];
  const unread = visible.filter((entry) => !read.has(entry.key));

  // While the log is expanded, all of its entries are read.
  if (isExpanded && unread.length > 0) {
    const next = new Set(read);
    unread.forEach((entry) => next.add(entry.key));
    setReadKeys({ ...readKeys, [perspective]: next });
  }

  // Pulse on new unread entries until the animation ends. Restarting the
  // animation needs a new element, hence the sequence number as its key.
  const [pulseSeq, setPulseSeq] = useState(0);
  const [pulseDoneSeq, setPulseDoneSeq] = useState(0);
  const isPulsing = pulseSeq > pulseDoneSeq;
  const [lastUnread, setLastUnread] = useState({
    perspective,
    count: unread.length,
  });
  if (
    lastUnread.perspective !== perspective ||
    lastUnread.count !== unread.length
  ) {
    if (
      !isExpanded &&
      lastUnread.perspective === perspective &&
      unread.length > lastUnread.count
    ) {
      setPulseSeq(pulseSeq + 1);
    }
    setLastUnread({ perspective, count: unread.length });
  }

  // Keep the newest entry in view, unless the user scrolled back.
  const listRef = useRef<HTMLOListElement | null>(null);
  const wasAtEnd = useRef(true);
  useEffect(() => {
    const list = listRef.current;
    if (list && wasAtEnd.current) list.scrollTop = list.scrollHeight;
  }, [visible.length, isExpanded, perspective]);

  if (!isExpanded) {
    return (
      <button
        className="event-log-toggle"
        onClick={() => {
          wasAtEnd.current = true;
          setIsExpanded(true);
        }}
        title="Show events"
        aria-label={`Show events (${unread.length} unread)`}
      >
        <span
          key={pulseSeq}
          className={isPulsing ? "event-log-icon pulse" : "event-log-icon"}
          onAnimationEnd={() => setPulseDoneSeq(pulseSeq)}
        >
          <FontAwesomeIcon icon={faMessage} />
        </span>
        {unread.length > 0 && (
          <span className="event-log-badge">
            {unread.length > 99 ? "99+" : unread.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="event-log">
      <div className="event-log-header">
        <span>
          Events · {perspective === "GOD" ? "BLUE + RED" : perspective}
        </span>
        <button
          className="event-log-collapse"
          onClick={() => setIsExpanded(false)}
          title="Hide events"
          aria-label="Hide events"
        >
          <FontAwesomeIcon icon={faChevronDown} />
        </button>
      </div>
      {visible.length === 0 ? (
        <div className="event-log-empty">No events yet.</div>
      ) : (
        <ol
          ref={listRef}
          className="event-log-list"
          onScroll={(event) => {
            const list = event.currentTarget;
            wasAtEnd.current =
              list.scrollHeight - list.scrollTop - list.clientHeight <
              AT_END_TOLERANCE;
          }}
        >
          {visible.map((entry) => (
            <li
              key={entry.key}
              className={entry.isLocal ? "event-log-entry local" : "event-log-entry"}
              style={{
                borderLeftColor:
                  (entry.party && PARTY_COLORS[entry.party]) ?? "transparent",
              }}
            >
              <span className="event-log-time">{formatTime(entry.time)}</span>
              <span className="event-log-msg">{entry.msg}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
