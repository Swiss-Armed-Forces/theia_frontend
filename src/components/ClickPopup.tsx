import type { LatLng } from "leaflet";
import { useState } from "react";
import { Popup, useMapEvents } from "react-leaflet";

export default function ClickPopup() {
  const [position, setPosition] = useState<LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? (
    <Popup
      position={position}
      eventHandlers={{ remove: () => setPosition(null) }}
    >
      <div>
        <strong>Lat:</strong> {position.lat.toFixed(5)}
        <br />
        <strong>Lon:</strong> {position.lng.toFixed(5)}
      </div>
    </Popup>
  ) : null;
}
