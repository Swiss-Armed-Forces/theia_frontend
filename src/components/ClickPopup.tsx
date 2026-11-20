import L from "leaflet";
import { useEffect } from "react";

/**
 * Popup with the coordinates of a click on the map.
 *
 * @param enabled whether map clicks open the popup; off while the player picks
 *   an action's target
 */
export default function ClickPopup({
  map,
  enabled,
}: {
  map: L.Map | null;
  enabled: boolean;
}) {
  useEffect(() => {
    if (!map || !enabled) return;
    const mapInstance = map;

    const popup = L.popup();

    function handleClick(e: L.LeafletMouseEvent) {
      popup
        .setLatLng(e.latlng)
        .setContent(
          `<div><strong>Lat:</strong> ${e.latlng.lat.toFixed(
            5,
          )}<br/><strong>Lon:</strong> ${e.latlng.lng.toFixed(5)}</div>`,
        )
        .openOn(mapInstance);
    }

    mapInstance.on("click", handleClick);
    return () => {
      mapInstance.off("click", handleClick);
      popup.remove();
    };
  }, [map, enabled]);

  return null;
}
