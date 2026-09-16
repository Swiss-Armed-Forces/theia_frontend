import L from "leaflet";
import { useEffect } from "react";
import type { GeoJSONFeature } from "../hooks/useRadarData";

export default function GeoJsonLayer({
  map,
  data,
  style,
  tooltipLabel,
}: {
  map: L.Map | null;
  data: GeoJSONFeature;
  style: L.PathOptions;
  tooltipLabel: string;
}) {
  // Deliberately NOT depending on `data`/`style` identity: react-leaflet's
  // original <GeoJSON data={feature}> never updated an existing layer's
  // geometry when `data` changed on re-render either, it only applied it
  // once at construction.
  useEffect(() => {
    if (!map) return;
    const layer = L.geoJSON(data, {
      style,
      onEachFeature: (_feature, featureLayer) =>
        featureLayer.bindTooltip(tooltipLabel),
    });
    layer.addTo(map);
    return () => {
      layer.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, tooltipLabel]);

  return null;
}
