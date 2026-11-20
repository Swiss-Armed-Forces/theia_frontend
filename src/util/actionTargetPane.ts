import type L from "leaflet";

/**
 * Pane of the action target highlights (attack targets, transport
 * destinations): above the markers (600), so the symbols don't cover the
 * highlights and catch their clicks, and below the tooltips (650).
 */
const ACTION_TARGET_PANE = "actionTargetPane";
const ACTION_TARGET_PANE_Z_INDEX = "640";

/** Name of the action target pane of `map`; created on first use. */
export function actionTargetPane(map: L.Map): string {
  if (!map.getPane(ACTION_TARGET_PANE)) {
    map.createPane(ACTION_TARGET_PANE).style.zIndex = ACTION_TARGET_PANE_Z_INDEX;
  }
  return ACTION_TARGET_PANE;
}
