import type { CampSiteState, TransportTime } from "../hooks/useGameData";
import type { Team } from "../hooks/useRadarData";

// Same symbol as the backend's camp site targets (`TargetInfos.UNKNOWN`
// template), with the side's standard identity: 3 = friend, 6 = hostile.
export function campSiteSidc(team: Team): string {
  return `102${team === "BLUE" ? "3" : "6"}1000000000000000`;
}

// "cruise_missile" -> "Cruise missile"
export function formatAmmoType(ammoType: string): string {
  const words = ammoType.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatStatus(site: CampSiteState): string {
  if (!site.is_alive) return "Destroyed";
  if (site.seconds_until_ready > 0) {
    return `Reloading (${Math.ceil(site.seconds_until_ready)} s)`;
  }
  return "Ready";
}

export type ActionKind = "attack" | "transport";

/** Whether an action is offered for a camp site and, if so, if it's possible. */
export type ActionAvailability = {
  kind: ActionKind;
  /** Reason why the action is not possible right now; `null` if it is. */
  disabledReason: string | null;
};

/**
 * Actions offered for a camp site, mirroring the backend's validation:
 * - Attack: only launch sites; needs to be alive, have stock and be ready.
 * - Transport: only if a route starts at the site; needs to be alive and
 *   have stock.
 */
export function availableActions(
  site: CampSiteState,
  transportTimes: TransportTime[],
): ActionAvailability[] {
  const actions: ActionAvailability[] = [];
  if (site.can_launch) {
    let reason: string | null = null;
    if (!site.is_alive) reason = "The launch site is destroyed.";
    else if (site.n_ammo === 0) reason = "No ammunition in stock.";
    else if (site.seconds_until_ready > 0) {
      reason = `Reloading: ready in ${Math.ceil(site.seconds_until_ready)} s.`;
    }
    actions.push({ kind: "attack", disabledReason: reason });
  }
  if (transportTimes.some((route) => route.source_site_id === site.id)) {
    let reason: string | null = null;
    if (!site.is_alive) reason = "The camp site is destroyed.";
    else if (site.n_ammo === 0) reason = "No ammunition in stock.";
    actions.push({ kind: "transport", disabledReason: reason });
  }
  return actions;
}

/** 45 -> "45 s", 720 -> "12 min", 3900 -> "1 h 05 min" */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  return `${h} h ${String(minutes % 60).padStart(2, "0")} min`;
}
