import {
  BLUE_GEOJSON_COLOR,
  ESRI_SATELLITE_TILE_SERVER,
  OSM_TILE_SERVER,
  PERSPECTIVES,
  RED_GEOJSON_COLOR,
} from "../contexts/constants";
import { type Perspective } from "../contexts/SettingsContext";
import { useSettings } from "../hooks/useSettings";
import ButtonGroup from "./ButtonGroup";
import ChipList from "./ChipList";
import Switch from "./Switch";

function isPerspective(value: unknown): value is Perspective {
  return (
    typeof value === "string" && PERSPECTIVES.includes(value as Perspective)
  );
}

export default function SettingsForm({
  blueGeoJsonKeys,
  redGeoJsonKeys,
  hiddenBlueKeys,
  hiddenRedKeys,
  onToggleBlue,
  onToggleRed,
}: {
  blueGeoJsonKeys: string[];
  redGeoJsonKeys: string[];
  hiddenBlueKeys: Set<string>;
  hiddenRedKeys: Set<string>;
  onToggleBlue: (key: string) => void;
  onToggleRed: (key: string) => void;
}) {
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
      {["BLUE", "GOD"].includes(settings.perspective) && (
        <fieldset
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <legend>Blue Overlays</legend>
          <ChipList
            keys={blueGeoJsonKeys}
            hiddenKeys={hiddenBlueKeys}
            onToggle={onToggleBlue}
            color={BLUE_GEOJSON_COLOR}
          />
        </fieldset>
      )}
      {["RED", "GOD"].includes(settings.perspective) && (
        <fieldset
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <legend>Red Overlays</legend>
          <ChipList
            keys={redGeoJsonKeys}
            hiddenKeys={hiddenRedKeys}
            onToggle={onToggleRed}
            color={RED_GEOJSON_COLOR}
          />
        </fieldset>
      )}
    </div>
  );
}
