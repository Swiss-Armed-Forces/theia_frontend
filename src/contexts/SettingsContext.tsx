import { createContext } from "react";
import type { LatLonHeightGrid } from "../hooks/useRadarData";

export type Settings = {
  minHeight: number;
  maxHeight: number;
  nHeightBins: number;
  coverageAlt: number;
  coverageAzimuthResDegree: number;
  displayGroundTruth: boolean;
  extrapolate: boolean;
  primaryMuted: string;
  primaryBackground: string;
  panelBackground: string;
  borderColor: string;
  accent: string;
  textColor: string;
  natoBlue: string;
  natoRed: string;
  tileServerConfig: TileServerConfig;
  pclCalcGrid: LatLonHeightGrid;
};

const DEFAULT_PCL_COVERAGE_GRID: LatLonHeightGrid = {
  lat_start: 46.92588,
  lat_stop: 47.67648,
  lat_res: 0.01,
  lon_start: 7.47648,
  lon_stop: 8.42396,
  lon_res: 0.01,
  height_start: 2000.0,
  height_stop: 2000.0,
  height_res: 1.0,
};

type TileServerConfig = {
  name: "Map" | "Satellite";
  url: string;
  attribution: string;
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
  coverageAlt: 2000,
  coverageAzimuthResDegree: 2,
  displayGroundTruth: false,
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
};

export type SettingsContextType = {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
};

// Provide a properly typed default value
export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSetting: () => {}, // no-op default
});
