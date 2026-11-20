import type L from "leaflet";
import { useEffect, useRef, useState } from "react";
import type { CampSiteState, TransportTime } from "../hooks/useGameData";
import type { Team } from "../hooks/useRadarData";
import type { ActionKind } from "../util/campSites";
import ActionPopup from "./ActionPopup";
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
  actionMode,
  onActionModeChange,
}: {
  map: L.Map | null;
  team: Team;
  campSites: CampSiteState[];
  transportTimes: TransportTime[];
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
    onActionModeChange({ kind, siteId: site.id });
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
      {actionMode && modeSite && (
        <div className="action-banner">
          <span>
            <strong>
              {actionMode.kind === "attack" ? "Attack" : "Transport"}
            </strong>{" "}
            from {modeSite.name}: {BANNER_TEXT[actionMode.kind]}. Esc or
            right-click to cancel.
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
