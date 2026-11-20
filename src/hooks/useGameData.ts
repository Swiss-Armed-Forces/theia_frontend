import { useEffect, useState } from "react";
import type { components } from "./schema";
import type { Team } from "./useRadarData";

export type CampSiteState = components["schemas"]["CampSiteState"];
export type TransportTime = components["schemas"]["TransportTime"];
export type LaunchAction = components["schemas"]["LaunchAction"];
export type MoveStockAction = components["schemas"]["MoveStockAction"];

// The backend fills in `id`, `time` and `party` of an action itself.
type ServerFilled = "id" | "time" | "party";
export type ActionRequest =
  | Omit<LaunchAction, ServerFilled>
  | Omit<MoveStockAction, ServerFilled>;

export type GameData = {
  /** Whether the visible side is controlled by the user (never in GOD view). */
  isUserControlled: boolean;
  campSites: CampSiteState[];
  transportTimes: TransportTime[];
};

const BASE_URL = "http://localhost:8000";

const NO_GAME_DATA: GameData = {
  isUserControlled: false,
  campSites: [],
  transportTimes: [],
};

/**
 * Game state of the visible side: whether the user controls it, its camp
 * sites and its transport routes.
 *
 * @param team visible side, or `null` in the GOD perspective (no actions)
 * @param time current simulation time; the camp sites are refreshed on change
 */
export default function useGameData(team: Team | null, time: Date): GameData {
  const [controlled, setControlled] = useState<{
    team: Team | null;
    isUserControlled: boolean;
  }>({ team: null, isUserControlled: false });
  const [campSites, setCampSites] = useState<{
    team: Team | null;
    sites: CampSiteState[];
  }>({ team: null, sites: [] });
  const [transportTimes, setTransportTimes] = useState<{
    team: Team | null;
    routes: TransportTime[];
  }>({ team: null, routes: [] });

  const isUserControlled =
    team !== null &&
    controlled.team === team &&
    controlled.isUserControlled;

  // Whether the side is user-controlled: once per perspective.
  useEffect(() => {
    if (team === null) return;
    let cancelled = false;
    fetchIsUserControlled(team)
      .then((value) => {
        if (!cancelled) setControlled({ team, isUserControlled: value });
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, [team]);

  // Transport routes are static: once per perspective.
  useEffect(() => {
    if (team === null || !isUserControlled) return;
    let cancelled = false;
    fetchTransportTimes(team)
      .then((routes) => {
        if (!cancelled) setTransportTimes({ team, routes });
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, [team, isUserControlled]);

  // Camp sites change over time: on every time tick.
  useEffect(() => {
    if (team === null || !isUserControlled) return;
    let cancelled = false;
    fetchCampSites(team)
      .then((status) => {
        if (!cancelled) {
          setCampSites({ team, sites: status.sites });
        }
      })
      .catch((error) => console.error(error));
    return () => {
      cancelled = true;
    };
  }, [team, isUserControlled, time]);

  if (!isUserControlled) {
    return NO_GAME_DATA;
  }
  // Never show data of the previously visible side while switching.
  return {
    isUserControlled,
    campSites: campSites.team === team ? campSites.sites : [],
    transportTimes: transportTimes.team === team ? transportTimes.routes : [],
  };
}

/**
 * Queue an action for the given side.
 *
 * @returns whether the side accepts actions. The action's outcome arrives
 *   later as an event.
 */
export async function postAction(
  team: Team,
  action: ActionRequest,
): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/assign_action/${team}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(action),
  });
  if (!response.ok) {
    const error = await response.json();
    console.error("Validation error:", JSON.stringify(error, null, 2));
    throw new Error(`POST /assign_action/${team} failed: ${response.status}`);
  }
  return response.json();
}

async function fetchIsUserControlled(team: Team): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/is_user_controlled/${team}`);
  if (!response.ok) {
    throw new Error(`GET /is_user_controlled/${team} failed: ${response.status}`);
  }
  return response.json();
}

async function fetchCampSites(
  team: Team,
): Promise<components["schemas"]["CampSitesStatus"]> {
  const response = await fetch(`${BASE_URL}/camp_sites/${team}`);
  if (!response.ok) {
    throw new Error(`GET /camp_sites/${team} failed: ${response.status}`);
  }
  return response.json();
}

async function fetchTransportTimes(team: Team): Promise<TransportTime[]> {
  const response = await fetch(`${BASE_URL}/transport_times/${team}`);
  if (!response.ok) {
    throw new Error(`GET /transport_times/${team} failed: ${response.status}`);
  }
  return response.json();
}
