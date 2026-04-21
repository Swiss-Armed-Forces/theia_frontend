import { Marker, Tooltip } from "react-leaflet";
import type { Sensor } from "../hooks/useRadarData";
import L from "leaflet";
import ms from "milsymbol";

const friendlyRadarSymbol = new ms.Symbol("10231500002203000000", { size: 24 });

const radarIcon = L.divIcon({
  html: friendlyRadarSymbol.asSVG(),
  className: "", // remove default 'leaflet-div-icon' styles if needed
  iconSize: [24, 24],
  iconAnchor: [12, 12], // center the icon
});

function MonostaticRadarTooltip({ radar }: { radar: Sensor }) {
  // Format the tooltip.
  const latStr = radar.receiver.point.lat.toFixed(4);
  const lonStr = radar.receiver.point.lon.toFixed(4);
  const altStr = radar.receiver.point.alt.toFixed(1);

  const maxBefore = Math.max(
    latStr.indexOf("."),
    lonStr.indexOf("."),
    altStr.indexOf("."),
  );

  const alignDecimal = (s: string) =>
    "\u00A0".repeat(maxBefore - s.indexOf(".")) + s;

  return (
    <Tooltip direction="top" offset={[0, -10]}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto",
          columnGap: "8px",
          fontFamily: "monospace",
        }}
      >
        <span style={{ textAlign: "right", fontWeight: "bold" }}>
          Radar ID:
        </span>
        <span>{radar.receiver.id}</span>
        <span style={{ textAlign: "right", fontWeight: "bold" }}>Lat:</span>
        <span>{alignDecimal(latStr)}°</span>
        <span style={{ textAlign: "right", fontWeight: "bold" }}>Lon:</span>
        <span>{alignDecimal(lonStr)}°</span>
        <span style={{ textAlign: "right", fontWeight: "bold" }}>
          Alt [MASL]:
        </span>
        <span>{alignDecimal(altStr)}</span>
        <span style={{ textAlign: "right", fontWeight: "bold" }}>
          Frequency:
        </span>
        <span>
          {alignDecimal((radar.transmitter.frequency / 1000).toFixed(2))} GHz
        </span>
        <span style={{ textAlign: "right", fontWeight: "bold" }}>
          Bandwidth:
        </span>
        <span>
          {alignDecimal(radar.receiver.bandwidth.toFixed(2))} MHz
        </span>
        <span style={{ textAlign: "right", fontWeight: "bold" }}>
          Noise temperature:
        </span>
        <span>
          {alignDecimal(radar.receiver.noise_temperature.toFixed(2))} K
        </span>
        <span style={{ textAlign: "right", fontWeight: "bold" }}>
          Prob. false alarm:
        </span>
        <span>
          {alignDecimal(radar.receiver.pfa.toExponential(2))}
        </span>
        <span style={{ textAlign: "right", fontWeight: "bold" }}>
          Rotation time:
        </span>
        <span>
          {alignDecimal(radar.receiver.rotation_time.toFixed(2))} s
        </span>
      </div>
    </Tooltip>
  );
}

export default function MonostaticRadarMarker({
  radar,
  onClick,
}: {
  radar: Sensor;
  onClick: () => void;
}) {
  return (
    <Marker
      position={[radar.receiver.point.lat, radar.receiver.point.lon]}
      icon={radarIcon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <MonostaticRadarTooltip radar={radar} />
    </Marker>
  );
}
