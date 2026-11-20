import L from "leaflet";
import ms from "milsymbol";

/**
 * Leaflet icon of a military symbol, anchored at the symbol's centre.
 *
 * The SVG is usually larger than the nominal `size` (frame, amplifiers,
 * text modifiers), so its size and anchor must come from milsymbol, not from
 * `size`. Otherwise the symbol is drawn off its geographic position.
 *
 * @param wrapperStyle optional inline CSS for a wrapper around the SVG
 */
export function milsymbolIcon(
  symbol: InstanceType<typeof ms.Symbol>,
  wrapperStyle?: string,
): L.DivIcon {
  const size = symbol.getSize();
  const anchor = symbol.getAnchor();
  const svg = symbol.asSVG();
  return L.divIcon({
    html: wrapperStyle ? `<div style="${wrapperStyle}">${svg}</div>` : svg,
    className: "", // remove default 'leaflet-div-icon' styles
    iconSize: [size.width, size.height],
    iconAnchor: [anchor.x, anchor.y],
  });
}
