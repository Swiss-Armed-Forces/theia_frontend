import type { GroundTruth, Point, Track } from "../hooks/useRadarData";
import ms from "milsymbol";
import L from "leaflet";
import { useEffect, useRef, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { milsymbolIcon } from "../util/milsymbolIcon";
import { formatCategory } from "../util/utils";

const TOOLTIP_OPTS: L.TooltipOptions = { direction: "top", offset: [0, -10] };
/** Same look as a destroyed camp site */
const DEACTIVATED_STYLE = "filter: grayscale(1); opacity: 0.5;";

function createIcon(sidc: string, isDeactivated: boolean): L.DivIcon {
  return milsymbolIcon(
    new ms.Symbol(sidc, { size: 24 }),
    isDeactivated ? DEACTIVATED_STYLE : undefined,
  );
}

function TargetMarker({
  map,
  tooltip,
  position,
  sidc,
  isDeactivated,
  onClick,
  onContextMenu,
}: {
  map: L.Map | null;
  tooltip: ReactElement;
  position: Point;
  sidc: string;
  isDeactivated: boolean;
  onClick?: () => void;
  onContextMenu?: () => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const iconKeyRef = useRef<string | null>(null);
  // The marker is created once; it calls the latest handlers via these refs.
  const onClickRef = useRef(onClick);
  const onContextMenuRef = useRef(onContextMenu);
  const iconKey = `${sidc}|${isDeactivated}`;

  // Effect A: create the marker once per map instance.
  useEffect(() => {
    if (!map) return;
    const icon = createIcon(sidc, isDeactivated);
    const marker = L.marker([position.lat, position.lon], { icon });
    // Bind the tooltip once; Effect B only updates its content in place.
    // Re-binding on every poll tick would close an open (hovered) tooltip.
    marker.bindTooltip("", TOOLTIP_OPTS);
    marker.on("click", () => onClickRef.current?.());
    marker.on("contextmenu", (event: L.LeafletMouseEvent) => {
      const handler = onContextMenuRef.current;
      if (!handler) return;
      L.DomEvent.preventDefault(event.originalEvent); // no browser menu
      handler();
    });
    marker.addTo(map);
    markerRef.current = marker;
    iconKeyRef.current = iconKey;
    return () => {
      marker.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Effect B: push the latest data onto the existing marker every render,
  // without removing/re-adding it, to avoid flicker on each poll tick.
  useEffect(() => {
    onClickRef.current = onClick;
    onContextMenuRef.current = onContextMenu;
    const marker = markerRef.current;
    if (!marker) return;
    marker.setLatLng([position.lat, position.lon]);
    // setIcon() replaces the icon's DOM element, so only do it on change.
    if (iconKeyRef.current !== iconKey) {
      marker.setIcon(createIcon(sidc, isDeactivated));
      iconKeyRef.current = iconKey;
    }
    marker.setTooltipContent(renderToStaticMarkup(tooltip));
  });

  return null;
}

export default function TrajectoryLayer({
  map,
  trajectory,
  isDeactivated = false,
  onClick,
  onContextMenu,
}: {
  map: L.Map | null;
  trajectory: GroundTruth | Track;
  /** Whether the target is switched off (e.g. a radar); drawn grayed out */
  isDeactivated?: boolean;
  /** Called when the target's icon is clicked */
  onClick?: () => void;
  /** Called when the target's icon is right-clicked */
  onContextMenu?: () => void;
}) {
  const currentPoint = trajectory.points[0];
  const id = "target_id" in trajectory ? trajectory.target_id : trajectory.id;

  const latStr = currentPoint.lat.toFixed(4);
  const lonStr = currentPoint.lon.toFixed(4);
  const altStr = currentPoint.alt.toFixed(0);

  const maxBefore = Math.max(
    latStr.indexOf("."),
    lonStr.indexOf("."),
    altStr.indexOf("."),
  );

  const alignDecimal = (s: string) =>
    " ".repeat(maxBefore - s.indexOf(".")) + s;

  const tooltip = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto",
        columnGap: "8px",
        fontFamily: "monospace",
      }}
    >
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        {"target_id" in trajectory ? "Target ID:" : "Track ID:"}
      </span>
      <span>{id}</span>
      {"name" in trajectory && trajectory.name && (
        <>
          <span style={{ textAlign: "right", fontWeight: "bold" }}>
            Name:
          </span>
          <span>{trajectory.name}</span>
        </>
      )}
      {trajectory.info.category !== "UNKNOWN" && (
        <>
          <span style={{ textAlign: "right", fontWeight: "bold" }}>
            Category:
          </span>
          <span>{formatCategory(trajectory.info.category)}</span>
        </>
      )}
      {isDeactivated && (
        <>
          <span style={{ textAlign: "right", fontWeight: "bold" }}>
            Status:
          </span>
          <span>Switched off</span>
        </>
      )}
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        Latitude:
      </span>
      <span>{alignDecimal(latStr)} °</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        Longitude:
      </span>
      <span>{alignDecimal(lonStr)} °</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        Altitude [MASL]:
      </span>
      <span>{altStr} m</span>
    </div>
  );
  return (
    <TargetMarker
      map={map}
      position={currentPoint}
      sidc={trajectory.sidc}
      tooltip={tooltip}
      isDeactivated={isDeactivated}
      onClick={onClick}
      onContextMenu={onContextMenu}
    />
  );
}
