import type { Receiver, Sensor, Transmitter } from "../hooks/useRadarData";
import L from "leaflet";
import ms from "milsymbol";
import { useEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const friendlyRadarSymbol = new ms.Symbol("10231500002203000000", { size: 24 });
const friendlyReceiverSymbol = new ms.Symbol("10231500002203000000", {
  size: 24,
  additionalInformation: "Receiver",
});
const civilTransmitterSymbol = new ms.Symbol("10242000001212010000", {
  size: 24,
});

const radarIcon = L.divIcon({
  html: friendlyRadarSymbol.asSVG(),
  className: "", // remove default 'leaflet-div-icon' styles if needed
  iconSize: [24, 24],
  iconAnchor: [12, 12], // center the icon
});

const receiverIcon = L.divIcon({
  html: friendlyReceiverSymbol.asSVG(),
  className: "", // remove default 'leaflet-div-icon' styles if needed
  iconSize: [24, 24],
  iconAnchor: [12, 12], // center the icon
});

const transmitterIcon = L.divIcon({
  html: civilTransmitterSymbol.asSVG(),
  className: "", // remove default 'leaflet-div-icon' styles if needed
  iconSize: [24, 24],
  iconAnchor: [12, 12], // center the icon
});

function ReceiverDescription({ receiver }: { receiver: Receiver }) {
  const latStr = receiver.point.lat.toFixed(4);
  const lonStr = receiver.point.lon.toFixed(4);
  const altStr = receiver.point.alt.toFixed(1);

  const maxBefore = Math.max(
    latStr.indexOf("."),
    lonStr.indexOf("."),
    altStr.indexOf("."),
  );

  const alignDecimal = (s: string) =>
    " ".repeat(maxBefore - s.indexOf(".")) + s;

  return (
    <>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>Lat:</span>
      <span>{alignDecimal(latStr)}°</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>Lon:</span>
      <span>{alignDecimal(lonStr)}°</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        Alt [MASL]:
      </span>
      <span>{alignDecimal(altStr)}</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>Bandwidth:</span>
      <span>{alignDecimal(receiver.bandwidth.toFixed(2))} MHz</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        Noise temperature:
      </span>
      <span>{alignDecimal(receiver.noise_temperature.toFixed(2))} K</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        Prob. false alarm:
      </span>
      <span>{alignDecimal(receiver.pfa.toExponential(2))}</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        Rotation time:
      </span>
      <span>{alignDecimal(receiver.rotation_time.toFixed(2))} s</span>
    </>
  );
}

function TransmitterDescription({
  transmitter,
  showLocation,
}: {
  transmitter: Transmitter;
  showLocation: boolean;
}) {
  const latStr = transmitter.point.lat.toFixed(4);
  const lonStr = transmitter.point.lon.toFixed(4);
  const altStr = transmitter.point.alt.toFixed(1);
  const freqStr = transmitter.frequency.toFixed(1);
  const powerStr = transmitter.power.toFixed(1);

  const maxBefore = Math.max(
    latStr.indexOf("."),
    lonStr.indexOf("."),
    altStr.indexOf("."),
    freqStr.indexOf("."),
    powerStr.indexOf("."),
  );

  const alignDecimal = (s: string) =>
    " ".repeat(maxBefore - s.indexOf(".")) + s;

  const locationInfo = showLocation ? (
    <>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>Lat:</span>
      <span>{alignDecimal(latStr)}°</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>Lon:</span>
      <span>{alignDecimal(lonStr)}°</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>
        Alt [MASL]:
      </span>
      <span>{alignDecimal(altStr)}</span>
    </>
  ) : (
    <></>
  );

  return (
    <>
      {locationInfo}
      <span style={{ textAlign: "right", fontWeight: "bold" }}>Power:</span>
      <span>{alignDecimal(powerStr)} W</span>
      <span style={{ textAlign: "right", fontWeight: "bold" }}>Frequency:</span>
      <span>{alignDecimal(transmitter.frequency.toFixed(2))} MHz</span>
    </>
  );
}

function MonostaticRadarTooltipContent({ radar }: { radar: Sensor }) {
  return (
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
      <span>{radar.id}</span>
      <ReceiverDescription receiver={radar.receiver} />
      <TransmitterDescription
        transmitter={radar.transmitter}
        showLocation={false}
      />
    </div>
  );
}

const TOOLTIP_OPTS: L.TooltipOptions = { direction: "top", offset: [0, -10] };

export function MonostaticRadarMarker({
  map,
  radar,
  onClick,
}: {
  map: L.Map | null;
  radar: Sensor;
  onClick: () => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  // Effect A: create the marker once per map instance.
  useEffect(() => {
    if (!map) return;
    const marker = L.marker(
      [radar.receiver.point.lat, radar.receiver.point.lon],
      { icon: radarIcon },
    );
    marker.addTo(map);
    markerRef.current = marker;
    return () => {
      marker.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Effect B: push the latest data onto the existing marker every render,
  // without removing/re-adding it, to avoid flicker on each poll tick.
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.setLatLng([radar.receiver.point.lat, radar.receiver.point.lon]);
    marker.setIcon(radarIcon);
    marker.bindTooltip(
      renderToStaticMarkup(<MonostaticRadarTooltipContent radar={radar} />),
      TOOLTIP_OPTS,
    );
    marker.off("click").on("click", onClick);
  });

  return null;
}

function PclReceiverTooltipContent({ receiver }: { receiver: Receiver }) {
  return (
    <>
      <span style={{ fontWeight: "bold" }}>
        PCL Receiver (ID {receiver.id})
      </span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto",
          columnGap: "8px",
          fontFamily: "monospace",
        }}
      >
        <ReceiverDescription receiver={receiver} />
      </div>
    </>
  );
}

function PclReceiverMarker({
  map,
  receiver,
}: {
  map: L.Map | null;
  receiver: Receiver;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!map) return;
    const marker = L.marker([receiver.point.lat, receiver.point.lon], {
      icon: receiverIcon,
    });
    marker.addTo(map);
    markerRef.current = marker;
    return () => {
      marker.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.setLatLng([receiver.point.lat, receiver.point.lon]);
    marker.setIcon(receiverIcon);
    marker.bindTooltip(
      renderToStaticMarkup(<PclReceiverTooltipContent receiver={receiver} />),
      TOOLTIP_OPTS,
    );
  });

  return null;
}

function PclTransmitterTooltipContent({
  transmitter,
}: {
  transmitter: Transmitter;
}) {
  return (
    <>
      <span style={{ fontWeight: "bold" }}>
        PCL Transmitter (ID {transmitter.id})
      </span>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto",
          columnGap: "8px",
          fontFamily: "monospace",
        }}
      >
        <TransmitterDescription transmitter={transmitter} showLocation={true} />
      </div>
    </>
  );
}

function PclTransmitterMarker({
  map,
  receiver: transmitter,
}: {
  map: L.Map | null;
  receiver: Transmitter;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!map) return;
    const marker = L.marker([transmitter.point.lat, transmitter.point.lon], {
      icon: transmitterIcon,
    });
    marker.addTo(map);
    markerRef.current = marker;
    return () => {
      marker.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.setLatLng([transmitter.point.lat, transmitter.point.lon]);
    marker.setIcon(transmitterIcon);
    marker.bindTooltip(
      renderToStaticMarkup(
        <PclTransmitterTooltipContent transmitter={transmitter} />,
      ),
      TOOLTIP_OPTS,
    );
  });

  return null;
}

export function PclSensorMarkers({
  map,
  sensor,
}: {
  map: L.Map | null;
  sensor: Sensor;
}) {
  return (
    <>
      <PclReceiverMarker map={map} receiver={sensor.receiver} />
      <PclTransmitterMarker map={map} receiver={sensor.transmitter} />
    </>
  );
}
