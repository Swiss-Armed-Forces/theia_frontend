import {
  ESRI_SATELLITE_TILE_SERVER,
  OSM_TILE_SERVER,
  PERSPECTIVES,
} from "../contexts/constants";
import { useSettings, type Perspective } from "../contexts/SettingsContext";
import type { LatLonHeightGrid } from "../hooks/useRadarData";
import ButtonGroup from "./ButtonGroup";
import GridDefinition from "./GridDefinition";
import Switch from "./Switch";

function isPerspective(value: unknown): value is Perspective {
  return (
    typeof value === "string" && PERSPECTIVES.includes(value as Perspective)
  );
}

export default function SettingsForm() {
  const { settings, updateSetting } = useSettings();
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
            on={settings.extrapolate}
            setOn={(on: boolean) => {
              updateSetting("extrapolate", on);
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
            updateSetting("perspective", value);
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
              updateSetting("tileServerConfig", OSM_TILE_SERVER);
            } else if (value === "Satellite") {
              updateSetting("tileServerConfig", ESRI_SATELLITE_TILE_SERVER);
            } else {
              throw new Error("This part of the code should never be reached!");
            }
          }}
        />
      </fieldset>
      <fieldset
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <legend>RAD coverage calculation</legend>
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
              on={settings.coverageRangeOnly}
              setOn={(on: boolean) => {
                updateSetting("coverageRangeOnly", on);
              }}
            />
            <span>Range only</span>
          </span>
        </div>
      </fieldset>
      <GridDefinition
        grid={settings.pclCalcGrid}
        setGrid={(grid: LatLonHeightGrid) => {
          updateSetting("pclCalcGrid", grid);
        }}
      />
    </div>
  );
}
