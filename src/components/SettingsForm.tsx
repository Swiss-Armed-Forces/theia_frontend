import type { Settings } from "../contexts/SettingsContext";
import Switch from "./Switch";

export default function SettingsForm({
  settings,
  setSettings,
}: {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}) {
  return (
    <>
      <Switch
        on={settings.displayGroundTruth}
        setOn={(on: boolean) => {
          setSettings({ ...settings, displayGroundTruth: on });
        }}
      />
      Ground Truth?
      <Switch
        on={settings.extrapolate}
        setOn={(on: boolean) => {
          setSettings({ ...settings, extrapolate: on });
        }}
      />
      Extrapolate?
    </>
  );
}
