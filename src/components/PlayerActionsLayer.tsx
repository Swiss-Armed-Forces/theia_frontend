import type L from "leaflet";
import { useEffect, useRef, useState } from "react";
import {
  postAction,
  type ActionRequest,
  type CampSiteState,
  type TransportTime,
} from "../hooks/useGameData";
import type { Point, Team, Track } from "../hooks/useRadarData";
import type { ActionKind } from "../util/campSites";
import ActionPopup from "./ActionPopup";
import AttackTargetsLayer from "./AttackTargetsLayer";
import ParameterDialog from "./ParameterDialog";
import TransportTargetsLayer from "./TransportTargetsLayer";
import CampSiteMarker from "./CampSiteMarker";

/** An action the player has started and whose target is being picked. */
export type ActionMode = { kind: ActionKind; siteId: number };

const BANNER_TEXT: Record<ActionKind, string> = {
  attack: "click a target",
  transport: "click a destination",
};

/**
 * Own camp sites of a user-controlled side and the actions started on them:
 * a click on a camp site opens its action popup; a button in the popup starts
 * an action mode, in which the player picks the action's target. Esc or a
 * right-click cancels the action mode.
 */
export default function PlayerActionsLayer({
  map,
  team,
  campSites,
  transportTimes,
  attackTargets,
  onActionFailed,
  actionMode,
  onActionModeChange,
}: {
  map: L.Map | null;
  team: Team;
  campSites: CampSiteState[];
  transportTimes: TransportTime[];
  /** Enemy tracks the side can attack */
  attackTargets: Track[];
  /** Called with a message if an action could not be sent */
  onActionFailed: (msg: string) => void;
  /** Current action mode; only valid while its camp site is alive */
  actionMode: ActionMode | null;
  onActionModeChange: (mode: ActionMode | null) => void;
}) {
  // Each click on a camp site is a new request, so the popup reliably
  // (re)opens: Leaflet itself closes an open popup when its marker is clicked
  // again, and a state update to an unchanged site ID would not re-render.
  const [popupRequest, setPopupRequest] = useState<{
    siteId: number;
    seq: number;
  } | null>(null);
  const popupSeq = useRef(0);
  const popupSite = campSites.find((site) => site.id === popupRequest?.siteId);
  const modeSite = campSites.find((site) => site.id === actionMode?.siteId);
  // Destination picked in the transport mode; its count is being entered.
  const [transportTargetId, setTransportTargetId] = useState<number | null>(
    null,
  );
  const transportTarget =
    actionMode?.kind === "transport"
      ? campSites.find((site) => site.id === transportTargetId)
      : undefined;

  // Cancel the action mode with Esc or a right-click on the map.
  useEffect(() => {
    if (!map || actionMode === null) return;
    const cancel = () => onActionModeChange(null);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancel();
    };
    const container = map.getContainer();
    window.addEventListener("keydown", handleKeyDown);
    map.on("contextmenu", cancel);
    container.classList.add("action-mode");
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      map.off("contextmenu", cancel);
      container.classList.remove("action-mode");
    };
  }, [map, actionMode, onActionModeChange]);

  function handleSiteClick(site: CampSiteState) {
    // While picking a target, camp sites don't open their popup.
    if (actionMode !== null) return;
    popupSeq.current += 1;
    setPopupRequest({ siteId: site.id, seq: popupSeq.current });
  }

  function startAction(site: CampSiteState, kind: ActionKind) {
    setPopupRequest(null);
    setTransportTargetId(null);
    onActionModeChange({ kind, siteId: site.id });
  }

  // Leave the action mode right away: the outcome arrives as an event.
  function submit(action: ActionRequest) {
    setTransportTargetId(null);
    onActionModeChange(null);
    // A rejected action (`false`) is reported by the backend as an event.
    postAction(team, action).catch((error: unknown) => {
      console.error(error);
      onActionFailed(
        `[ACTION ${team}] could not be sent: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
  }

  function launchAt(destination: Point) {
    if (!actionMode) return;
    submit({ type: "launch", site_id: actionMode.siteId, destination });
  }

  function moveStock(target: CampSiteState, count: number) {
    if (!actionMode) return;
    submit({
      type: "move_stock",
      source_site_id: actionMode.siteId,
      target_site_id: target.id,
      count,
    });
  }

  return (
    <>
      {campSites.map((site) => (
        <CampSiteMarker
          key={site.id}
          map={map}
          site={site}
          team={team}
          onClick={() => handleSiteClick(site)}
        />
      ))}
      {popupRequest && popupSite && actionMode === null && (
        <ActionPopup
          key={popupRequest.seq}
          map={map}
          site={popupSite}
          transportTimes={transportTimes}
          onStartAction={(kind) => startAction(popupSite, kind)}
          onClose={() => setPopupRequest(null)}
        />
      )}
      {actionMode?.kind === "attack" && modeSite && (
        <AttackTargetsLayer
          map={map}
          team={team}
          targets={attackTargets}
          onPick={launchAt}
        />
      )}
      {actionMode?.kind === "transport" && modeSite && (
        <TransportTargetsLayer
          map={map}
          team={team}
          source={modeSite}
          campSites={campSites}
          transportTimes={transportTimes}
          onPick={(destination) => setTransportTargetId(destination.id)}
        />
      )}
      {modeSite && transportTarget && (
        <ParameterDialog
          key={transportTarget.id}
          title="Transport"
          description={`From ${modeSite.name} to ${transportTarget.name}`}
          fields={[
            {
              key: "count",
              label: "Rounds",
              min: 1,
              max: modeSite.n_ammo,
              default: modeSite.n_ammo,
            },
          ]}
          submitLabel="Transport"
          onSubmit={({ count }) => moveStock(transportTarget, count)}
          // Back to the transport mode: another destination can be picked.
          onCancel={() => setTransportTargetId(null)}
        />
      )}
      {actionMode && modeSite && (
        <div className="action-banner">
          <span>
            <strong>
              {actionMode.kind === "attack" ? "Attack" : "Transport"}
            </strong>{" "}
            from {modeSite.name}: {BANNER_TEXT[actionMode.kind]}. Esc or
            right-click to cancel.
            {actionMode.kind === "attack" && attackTargets.length === 0 && (
              <> No enemy ground targets known.</>
            )}
          </span>
          <button
            className="action-button"
            onClick={() => onActionModeChange(null)}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
