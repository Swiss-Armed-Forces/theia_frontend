import L from "leaflet";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Point } from "../hooks/useRadarData";

/**
 * Leaflet popup with interactive React content.
 *
 * The children are rendered into the popup's content node through a portal,
 * so they keep their event handlers (unlike `renderToStaticMarkup`). The
 * popup opens on mount and closes on unmount; `onClose` is called if the user
 * closes it (close button, click on the map, another popup opening).
 */
export default function MapPopup({
  map,
  position,
  onClose,
  className,
  children,
}: {
  map: L.Map | null;
  position: Point;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}) {
  const [container] = useState(() => document.createElement("div"));
  const [popup] = useState(() =>
    L.popup({ offset: [0, -12], className })
      .setLatLng([position.lat, position.lon])
      .setContent(container),
  );
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!map) return;
    const handleRemove = () => onCloseRef.current();
    popup.openOn(map);
    popup.on("remove", handleRemove);
    return () => {
      // Detach first: closing on unmount is not a close by the user.
      popup.off("remove", handleRemove);
      map.closePopup(popup);
    };
  }, [map, popup]);

  useEffect(() => {
    popup.setLatLng([position.lat, position.lon]);
  }, [popup, position.lat, position.lon]);

  // Re-measure the popup after its content changed.
  useEffect(() => {
    if (popup.isOpen()) popup.update();
  });

  return createPortal(children, container);
}
