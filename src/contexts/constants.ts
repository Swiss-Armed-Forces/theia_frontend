import type { Settings } from "./SettingsContext";

export const PERSPECTIVES = ["BLUE", "RED", "GOD"] as const;

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

export const SIDC = {
  BLUE_RADAR: "10231500002203000000",
  GREEN_TRANSMITTER: "10242000001212010000",
}

export const BLUE_GEOJSON_COLOR = "#1789FC";
export const RED_GEOJSON_COLOR = "#f2a202";

export const defaultSettings: Settings = {
  minHeight: 0,
  maxHeight: 15_000,
  nHeightBins: 31,
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
  perspective: "BLUE",
};