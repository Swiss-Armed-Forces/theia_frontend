import L from "leaflet";
import { useEffect } from "react";

export default function ClickPopup({ map }: { map: L.Map | null }) {
  useEffect(() => {
    if (!map) return;
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
  }, [map]);

  return null;
}
