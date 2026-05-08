import type { LatLonHeightGrid } from "../hooks/useRadarData";
import type { Settings } from "./SettingsContext";

export const PERSPECTIVES = ["BLUE", "RED", "GOD"] as const;

export const DEFAULT_PCL_COVERAGE_GRID: LatLonHeightGrid = {
  lat_start: 46.89586,
  lat_stop: 47.11407,
  lat_res: 0.01,
  lon_start: 8.15612,
  lon_stop: 8.61887,
  lon_res: 0.01,
  height_start: 1000.0,
  height_stop: 1000.0,
  height_res: 1.0,
};

export const OSM_TILE_SERVER = {
  name: "Map" as const,
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

export const ESRI_SATELLITE_TILE_SERVER = {
  name: "Satellite" as const,
  url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution:
    "Powered by Esri | Esri, Vantor, Earthstar Geographics, and the GIS User Community",
};

export const defaultSettings: Settings = {
  minHeight: 0,
  maxHeight: 15000,
  nHeightBins: 31,
  coverageAlt: 1000,
  coverageAzimuthResDegree: 2,
  coverageRangeOnly: true,
  extrapolate: false,
  primaryMuted: "#7ba7e4",
  primaryBackground: "#0F172A",
  panelBackground: "#1F2933",
  borderColor: "#374151",
  accent: "#E74C3C",
  textColor: "#E5E7EB",
  natoBlue: "#80e0ff",
  natoRed: "#ff8080",
  tileServerConfig: OSM_TILE_SERVER,
  pclCalcGrid: DEFAULT_PCL_COVERAGE_GRID,
  perspective: "BLUE",
};