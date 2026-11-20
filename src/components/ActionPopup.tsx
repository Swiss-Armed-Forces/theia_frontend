import type L from "leaflet";
import type { CampSiteState, TransportTime } from "../hooks/useGameData";
import {
  availableActions,
  formatAmmoType,
  formatStatus,
  type ActionKind,
} from "../util/campSites";
import MapPopup from "./MapPopup";

const ACTION_LABELS: Record<ActionKind, string> = {
  attack: "Attack",
  transport: "Transport",
};

/** Popup of an own camp site with the actions the player can start. */
export default function ActionPopup({
  map,
  site,
  transportTimes,
  onStartAction,
  onClose,
}: {
  map: L.Map | null;
  site: CampSiteState;
  transportTimes: TransportTime[];
  onStartAction: (kind: ActionKind) => void;
  onClose: () => void;
}) {
  const actions = availableActions(site, transportTimes);
  return (
    <MapPopup
      map={map}
      position={site.point}
      onClose={onClose}
      className="action-popup"
    >
      <div className="action-popup-title">{site.name}</div>
      <div className="action-popup-details">
        {site.can_launch ? "Launch site" : "Depot"} ·{" "}
        {formatAmmoType(site.ammo_type)} · Stock: {site.n_ammo} ·{" "}
        {formatStatus(site)}
      </div>
      {actions.length === 0 ? (
        <div className="action-popup-details">No actions available.</div>
      ) : (
        <div className="action-popup-buttons">
          {actions.map(({ kind, disabledReason }) => (
            <button
              key={kind}
              className="action-button"
              disabled={disabledReason !== null}
              title={disabledReason ?? undefined}
              onClick={() => onStartAction(kind)}
            >
              {ACTION_LABELS[kind]}
            </button>
          ))}
        </div>
      )}
    </MapPopup>
  );
}
