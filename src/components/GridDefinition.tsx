import type { LatLonHeightGrid } from "../hooks/useRadarData";
import "./GridDefinition.css";

export default function GridDefinition({
  grid,
  setGrid,
}: {
  grid: LatLonHeightGrid;
  setGrid: (grid: LatLonHeightGrid) => void;
}) {
  return (
    <fieldset style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <legend>PCL coverage calculation grid</legend>
      <label>
        {"Minimum (lat, lon) [°]"}
        <input
          type={"number"}
          name="lat_min"
          className="no-spinner"
          style={{ width: "8ch" }}
          value={grid.lat_start}
          onChange={(event) => {
            setGrid({
              ...grid,
              lat_start: parseFloat(event.target.value),
            });
          }}
        />
        {", "}
        <input
          type={"number"}
          name="lon_min"
          className="no-spinner"
          style={{ width: "8ch" }}
          value={grid.lon_start}
          onChange={(event) => {
            setGrid({
              ...grid,
              lon_start: parseFloat(event.target.value),
            });
          }}
        />
      </label>
      <label>
        {"Maximum (lat, lon) [°]"}
        <br />
        <input
          type={"number"}
          name="lat_max"
          className="no-spinner"
          style={{ width: "8ch" }}
          value={grid.lat_stop}
          onChange={(event) => {
            setGrid({
              ...grid,
              lat_stop: parseFloat(event.target.value),
            });
          }}
        />
        {", "}
        <input
          type={"number"}
          name="lon_max"
          className="no-spinner"
          style={{ width: "8ch" }}
          value={grid.lon_stop}
          onChange={(event) => {
            setGrid({
              ...grid,
              lon_stop: parseFloat(event.target.value),
            });
          }}
        />
        <br />
      </label>
      <label>
        {"Resolution (lat, lon) [°]"}
        <br />
        <input
          type={"number"}
          name="lat_res"
          className="no-spinner"
          style={{ width: "8ch" }}
          value={grid.lat_res}
          onChange={(event) => {
            setGrid({
              ...grid,
              lat_res: parseFloat(event.target.value),
            });
          }}
        />
        {", "}
        <input
          type={"number"}
          name="lon_res"
          className="no-spinner"
          style={{ width: "8ch" }}
          value={grid.lon_res}
          onChange={(event) => {
            setGrid({
              ...grid,
              lon_res: parseFloat(event.target.value),
            });
          }}
        />
      </label>
      <label>
        {"Altitude [MASL]"} <br />
        <input
          type={"number"}
          name="lon_res"
          className="no-spinner"
          style={{ width: "8ch" }}
          value={grid.height_start}
          onChange={(event) => {
            const value = parseFloat(event.target.value);
            setGrid({
              ...grid,
              height_start: value,
              height_stop: value,
              height_res: 1000,
            });
          }}
        />
      </label>
    </fieldset>
  );
}
