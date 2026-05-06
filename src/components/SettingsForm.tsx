import {
  ESRI_SATELLITE_TILE_SERVER,
  OSM_TILE_SERVER,
  PERSPECTIVES,
} from "../contexts/constants";
import { type Perspective, type Settings } from "../contexts/SettingsContext";
import type { LatLonHeightGrid } from "../hooks/useRadarData";
import ButtonGroup from "./ButtonGroup";
import GridDefinition from "./GridDefinition";
import Switch from "./Switch";

function isPerspective(value: unknown): value is Perspective {
  return (
    typeof value === "string" && PERSPECTIVES.includes(value as Perspective)
  );
}

export default function SettingsForm({
  settings,
  setSettings,
}: {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          gap: 3,
        }}
      >
        <span
          style={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            gap: 5,
          }}
        >
          <Switch
            on={settings.displayGroundTruth}
            setOn={(on: boolean) => {
              setSettings({ ...settings, displayGroundTruth: on });
            }}
          />
          <span>Display Ground Truth</span>
        </span>
        <span
          style={{
            display: "flex",
            flexDirection: "row",
            alignContent: "center",
            gap: 5,
          }}
        >
          <Switch
            on={settings.extrapolate}
            setOn={(on: boolean) => {
              setSettings({ ...settings, extrapolate: on });
            }}
          />
          <span>Extrapolate Trajectory</span>
        </span>
      </div>
      <fieldset
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <legend>Perspective</legend>
        <ButtonGroup
          options={PERSPECTIVES.map((p) => String(p))}
          value={settings.perspective}
          onChange={function (value: string): void {
            if (!isPerspective(value)) {
              throw new Error("Invalid Perspective!");
            }
            setSettings({ ...settings, perspective: value });
          }}
        />
      </fieldset>
      <fieldset
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <legend>Tiles</legend>
        <ButtonGroup
          options={["Map" as const, "Satellite" as const]}
          value={settings.tileServerConfig.name}
          onChange={function (value: string): void {
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
      </fieldset>
      <GridDefinition
        grid={settings.pclCalcGrid}
        setGrid={(grid: LatLonHeightGrid) => {
          setSettings({
            ...settings,
            pclCalcGrid: grid,
          });
        }}
      />
    </div>
  );
}
