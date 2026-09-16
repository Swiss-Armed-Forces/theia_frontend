import L from "leaflet";
import { useEffect, useId } from "react";

/**
 * BlurredTileLayer
 * ------------------
 * Creates a Leaflet tile layer that is visually blurred.
 *
 * How it works:
 * Leaflet renders each layer's tiles into a "pane" (a plain <div>).
 * We create a pane unique to this component, apply a CSS `filter: blur(...)`
 * to that pane, and create the tile layer with that pane as its target via
 * the `pane` option. Because the blur lives on the pane container (not on
 * individual <img> tiles), it stays applied uniformly as tiles load/unload
 * while panning and zooming.
 *
 * IMPORTANT — this is a *visual* blur only:
 * - The original tile images are still requested and present in the DOM.
 * - Anyone with browser dev tools can select the pane and delete/override
 *   the `filter` style, or read the raw tiles from the Network tab.
 * - Use this to keep details illegible on a shared screen / in a live
 *   demo, NOT as an access control for genuinely sensitive imagery.
 *   If the tile content itself must never reach the client unredacted,
 *   blur or redact it server-side (or serve pre-sanitized tiles) instead.
 *
 * Note: this component owns both the pane and the tile layer itself, and
 * creates them in an order it controls (pane first, then the tile layer
 * that targets it), so there's no cross-component mount-order race to work
 * around here — plain useEffects are fine.
 */

export interface BlurredTileLayerProps {
  /** The Leaflet map instance to attach the tile layer to. */
  map: L.Map | null;
  /** Tile layer URL template, e.g. "https://{s}.tile.osm.org/{z}/{x}/{y}.png". */
  url: string;
  /** Tile layer attribution string. */
  attribution: string;
  /** Tile server subdomains, e.g. ["a", "b", "c"]. */
  subdomains?: string[];
  /** px of blur applied via CSS filter. Default 8. */
  blurAmount?: number;
  /** Optionally desaturate along with blurring. Default false. */
  grayscale?: boolean;
  /** z-index for the created pane. Default 200 (Leaflet's default tile-pane tier). */
  paneZIndex?: number;
}

export function BlurredTileLayer({
  map,
  url,
  attribution,
  subdomains,
  blurAmount = 8,
  grayscale = false,
  paneZIndex = 200,
}: BlurredTileLayerProps): null {
  const rawId = useId().replace(/[:]/g, "");
  const paneName = `blurred-tile-pane-${rawId}`;

  // Create (idempotent) and style the custom pane.
  useEffect(() => {
    if (!map) return;
    const pane = map.getPane(paneName) ?? map.createPane(paneName);
    // Tiles are non-interactive visuals; avoid intercepting mouse events.
    pane.style.pointerEvents = "none";
    pane.style.zIndex = String(paneZIndex);
    const filters: string[] = [`blur(${blurAmount}px)`];
    if (grayscale) filters.push("grayscale(1)");
    pane.style.filter = filters.join(" ");
  }, [map, paneName, blurAmount, grayscale, paneZIndex]);

  // Create the tile layer targeting the blurred pane.
  useEffect(() => {
    if (!map) return;
    const tileLayer = L.tileLayer(url, {
      attribution,
      subdomains,
      pane: paneName,
    });
    tileLayer.addTo(map);
    return () => {
      tileLayer.remove();
    };
  }, [map, paneName, url, attribution, subdomains]);

  return null;
}

export default BlurredTileLayer;
