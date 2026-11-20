import ms from "milsymbol";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { CampSiteState } from "../hooks/useGameData";
import type { Team } from "../hooks/useRadarData";
import { milsymbolIcon } from "../util/milsymbolIcon";

const TOOLTIP_OPTS: L.TooltipOptions = { direction: "top", offset: [0, -10] };

// Same symbol as the backend's camp site targets (`TargetInfos.UNKNOWN`
// template), with the side's standard identity: 3 = friend, 6 = hostile.
function campSiteSidc(team: Team): string {
  return `102${team === "BLUE" ? "3" : "6"}1000000000000000`;
}

function createIcon(site: CampSiteState, team: Team): L.DivIcon {
  const symbol = new ms.Symbol(campSiteSidc(team), {
    size: 24,
    quantity: String(site.n_ammo),
    uniqueDesignation: site.name,
  });
  const style = site.is_alive ? undefined : "filter: grayscale(1); opacity: 0.5;";
  return milsymbolIcon(symbol, style);
}

// "cruise_missile" -> "Cruise missile"
function formatAmmoType(ammoType: string): string {
  const words = ammoType.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function formatStatus(site: CampSiteState): string {
  if (!site.is_alive) return "Destroyed";
  if (site.seconds_until_ready > 0) {
    return `Reloading (${Math.ceil(site.seconds_until_ready)} s)`;
  }
  return "Ready";
}

function CampSiteTooltip({ site }: { site: CampSiteState }) {
  const rows: [string, string][] = [
    ["Name:", site.name],
    ["Type:", site.can_launch ? "Launch site" : "Depot"],
    ["Ammunition:", formatAmmoType(site.ammo_type)],
    ["Stock:", String(site.n_ammo)],
    ["Status:", formatStatus(site)],
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto",
        columnGap: "8px",
        fontFamily: "monospace",
      }}
    >
      {rows.map(([label, value]) => (
        <span key={label} style={{ display: "contents" }}>
          <span style={{ textAlign: "right", fontWeight: "bold" }}>
            {label}
          </span>
          <span>{value}</span>
        </span>
      ))}
    </div>
  );
}

/** Own camp site of a user-controlled side, labelled with its stock. */
export default function CampSiteMarker({
  map,
  site,
  team,
}: {
  map: L.Map | null;
  site: CampSiteState;
  team: Team;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const iconKeyRef = useRef<string | null>(null);
  const iconKey = `${team}|${site.name}|${site.n_ammo}|${site.is_alive}`;

  // Effect A: create the marker once per map instance.
  useEffect(() => {
    if (!map) return;
    const marker = L.marker([site.point.lat, site.point.lon], {
      icon: createIcon(site, team),
    });
    // Bind the tooltip once; Effect B only updates its content in place.
    marker.bindTooltip("", TOOLTIP_OPTS);
    marker.addTo(map);
    markerRef.current = marker;
    iconKeyRef.current = iconKey;
    return () => {
      marker.remove();
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Effect B: push the latest state onto the existing marker on every
  // render, without re-adding it, to avoid flicker on each poll tick.
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    marker.setLatLng([site.point.lat, site.point.lon]);
    // setIcon() replaces the icon's DOM element, so only do it on change.
    if (iconKeyRef.current !== iconKey) {
      marker.setIcon(createIcon(site, team));
      iconKeyRef.current = iconKey;
    }
    marker.setTooltipContent(
      renderToStaticMarkup(<CampSiteTooltip site={site} />),
    );
  });

  return null;
}
