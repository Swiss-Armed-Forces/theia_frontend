import { useCallback, useEffect, useRef, useState } from "react";
import type { components } from "./schema";

export type EventMessage = components["schemas"]["EventMessage"];
export type Party = components["schemas"]["Party"];

/** An entry of the event log: a backend event or a local message. */
export type LogEntry = {
  /** Unique key; also the key of the entry's read status */
  key: string;
  time: Date;
  /** Side the entry belongs to; `null`: only shown in the GOD log */
  party: Party | null;
  msg: string;
  /** Created by the frontend (e.g. an action that could not be sent) */
  isLocal: boolean;
};

const BASE_URL = "http://localhost:8000";

/**
 * Some events (e.g. `TextEvent`s) have no unique ID (`id < 0`); they are
 * identified by their time and message instead.
 */
function eventKey(event: EventMessage): string {
  return event.id >= 0 ? `id:${event.id}` : `t:${event.time}|${event.msg}`;
}

function byTime(a: LogEntry, b: LogEntry): number {
  return a.time.getTime() - b.time.getTime();
}

/**
 * Event log of the simulation.
 *
 * Polls `/events` on every change of the simulation time, starting at the
 * time of the latest known event, and merges the result without duplicates.
 * If the simulation time jumps back behind the latest event (the simulation
 * was restarted), the log starts over.
 *
 * @param time current simulation time
 * @returns the entries sorted by time, and a function to add a local entry
 */
export default function useEvents(time: Date): {
  entries: LogEntry[];
  addLocalEntry: (party: Party | null, msg: string) => void;
} {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  // Start of the next query: the time of the latest event (inclusive, so no
  // event at that time is missed; duplicates are dropped by key).
  const latestTime = useRef<string | null>(null);
  // Generation of the log; responses of an older generation are dropped.
  const generation = useRef(0);
  const isFetching = useRef(false);
  const localSeq = useRef(0);
  // Time of the latest entry in the log, local entries included.
  const latestEntryTime = useRef<number | null>(null);
  const timeRef = useRef(time);
  useEffect(() => {
    timeRef.current = time;
  });

  useEffect(() => {
    // Not connected yet: the initial time is the epoch.
    if (time.getTime() === 0) return;

    // Simulation restarted: start over. The next response replaces the log.
    const isRestart =
      latestEntryTime.current !== null &&
      time.getTime() < latestEntryTime.current - 1000;
    if (isRestart) {
      generation.current += 1;
      latestTime.current = null;
      latestEntryTime.current = null;
      isFetching.current = false;
    }

    if (isFetching.current) return;
    isFetching.current = true;
    const thisGeneration = generation.current;
    fetchEvents(latestTime.current)
      .then((events) => {
        if (thisGeneration !== generation.current) return;
        if (events.length === 0 && !isRestart) return;
        for (const event of events) {
          if (latestTime.current === null || event.time > latestTime.current) {
            latestTime.current = event.time;
          }
        }
        setEntries((current) => {
          const prev = isRestart ? [] : current;
          const known = new Set(prev.map((entry) => entry.key));
          const added: LogEntry[] = events
            .filter((event) => !known.has(eventKey(event)))
            .map((event) => ({
              key: eventKey(event),
              time: new Date(event.time),
              party: event.party,
              msg: event.msg,
              isLocal: false,
            }));
          if (added.length === 0 && !isRestart) return prev;
          const next = [...prev, ...added].sort(byTime);
          latestEntryTime.current =
            next.length > 0 ? next[next.length - 1].time.getTime() : null;
          return next;
        });
      })
      .catch((error: unknown) => console.error(error))
      .finally(() => {
        if (thisGeneration === generation.current) isFetching.current = false;
      });
  }, [time]);

  const addLocalEntry = useCallback((party: Party | null, msg: string) => {
    localSeq.current += 1;
    const entry: LogEntry = {
      key: `local:${localSeq.current}`,
      time: timeRef.current,
      party,
      msg,
      isLocal: true,
    };
    setEntries((prev) => {
      const next = [...prev, entry].sort(byTime);
      latestEntryTime.current = next[next.length - 1].time.getTime();
      return next;
    });
  }, []);

  return { entries, addLocalEntry };
}

async function fetchEvents(tStart: string | null): Promise<EventMessage[]> {
  const query = tStart === null ? "" : `?t_start=${encodeURIComponent(tStart)}`;
  const response = await fetch(`${BASE_URL}/events${query}`);
  if (!response.ok) {
    throw new Error(`GET /events failed: ${response.status}`);
  }
  return response.json();
}
