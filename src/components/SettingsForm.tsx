import {
  ESRI_SATELLITE_TILE_SERVER,
  OSM_TILE_SERVER,
  type Settings,
} from "../contexts/SettingsContext";
import type { LatLonHeightGrid } from "../hooks/useRadarData";
import ButtonGroup from "./ButtonGroup";
import GridDefinition from "./GridDefinition";
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
      Display Ground Truth
      <br />
      <Switch
        on={settings.extrapolate}
        setOn={(on: boolean) => {
          setSettings({ ...settings, extrapolate: on });
        }}
      />
      Extrapolate Trajectory
      <br />
      <ButtonGroup
        options={["Map" as const, "Satellite" as const]}
        value={settings.tileServerConfig.name}
        onChange={function (value: string): void {
          console.log("onChange()");
          if (value === "Map") {
            setSettings({ ...settings, tileServerConfig: OSM_TILE_SERVER });
          } else if (value === "Satellite") {
            setSettings({
              ...settings,
              tileServerConfig: ESRI_SATELLITE_TILE_SERVER,
            });
          } else {
            throw new Error("This part of the code should never be reached!");
          }
        }}
      />
      <GridDefinition
        grid={settings.pclCalcGrid}
        setGrid={(grid: LatLonHeightGrid) => {
          console.log("SetPclGrid()", grid)
          setSettings({
            ...settings,
            pclCalcGrid: grid,
          });
        }}
      />
    </>
  );
}
