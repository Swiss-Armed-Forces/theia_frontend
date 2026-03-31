import { createContext } from "react";

export type Settings = {
  displayGroundTruth: boolean;
  extrapolate: boolean;
  primary: string;
  primaryMuted: string;
  primaryBackground: string;
  panelBackground: string;
  borderColor: string;
  accent: string;
  textColor: string;
  natoBlue: string;
  natoRed: string;
};

export const defaultSettings: Settings = {
  displayGroundTruth: false,
  extrapolate: false,
  primary: "#3388FF",
  primaryMuted: "#7ba7e4",
  primaryBackground: "#0F172A",
  panelBackground: "#1F2933",
  borderColor: "#374151",
  accent: "#E74C3C",
  textColor: "#E5E7EB",
  natoBlue: "#80e0ff",
  natoRed: "#ff8080",
};

export type SettingsContextType = {
  settings: Settings;
  updateSetting: (key: keyof Settings, value: boolean) => void;
};

// 👇 Provide a properly typed default value
export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSetting: () => {}, // no-op default
});
