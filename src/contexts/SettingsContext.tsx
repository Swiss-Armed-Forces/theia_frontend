import { createContext } from "react";
import type { LatLonHeightGrid } from "../hooks/useRadarData";
import { defaultSettings, type PERSPECTIVES } from "./constants";

export type Perspective = (typeof PERSPECTIVES)[number];

export type Settings = {
  minHeight: number;
  maxHeight: number;
  nHeightBins: number;
  coverageAlt: number;
  coverageAzimuthResDegree: number;
  coverageRangeOnly: boolean;
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
  perspective: Perspective;
};

type TileServerConfig = {
  name: "Map" | "Satellite";
  url: string;
  attribution: string;
};

type SettingsContextType = {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
};

// Provide a properly typed default value
export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSetting: () => {}, // no-op default
});
