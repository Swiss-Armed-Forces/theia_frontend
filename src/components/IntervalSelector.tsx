import { useRef } from "react";
import { linSpace } from "../util/utils";
import "./IntervalSelector.css";

function IntervalSegment({
  topLabel,
  bottomLabel,
  nInside,
  isTop,
  isBottom,
}: {
  topLabel: string;
  bottomLabel: string;
  nInside: number;
  isTop: boolean;
  isBottom: boolean;
}) {
  const tooltipText =
    nInside == 1 ? "1 Enemy Target" : `${nInside} Enemy Targets`;
  const tooltipSpan = (
    <span className="tooltiptext" style={{ width: `${tooltipText.length}em` }}>
      {tooltipText}
    </span>
  );
  return (
    <div className="intervalSegmentContainer">
      <div
        className={`tooltip intervalSegment ${isBottom ? "bottomRounded" : ""} ${isTop ? "topRounded" : ""} ${nInside > 0 ? "filled" : "empty"}`}
        style={{ width: "1em" }}
      >
        {nInside > 0 ? tooltipSpan : null}
      </div>
      <div style={{ width: "3em", display: "flex", flexDirection: "column" }}>
        <div className="intervalSegmentLabel topLabel">{topLabel}</div>
        <div className="intervalSegmentLabel bottomLabel">{bottomLabel}</div>
      </div>
    </div>
  );
}

export default function IntervalSelector({
  selectedRange,
  setSelectedRange,
  values,
  range = [0, 15000],
  nBins = 16,
  onRangeChange,
}: {
  selectedRange: [number, number];
  setSelectedRange: React.Dispatch<React.SetStateAction<[number, number]>>;
  values: number[];
  range: [number, number];
  nBins: number;
  onRangeChange?: (range: [number, number]) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bins = linSpace(range[0], range[1], nBins);

  const valueToPercent = (val: number) =>
    ((val - range[0]) / (range[1] - range[0])) * 100;

  const posToSnappedValue = (clientY: number): number => {
    if (!containerRef.current) return range[0];
    const rect = containerRef.current.getBoundingClientRect();
    const fraction = 1 - (clientY - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(1, fraction));
    const rawValue = range[0] + clamped * (range[1] - range[0]);
    const step = (range[1] - range[0]) / (nBins - 1);
    return Math.round((rawValue - range[0]) / step) * step + range[0];
  };

  const startDrag = (which: "top" | "bottom") => (e: React.MouseEvent) => {
    e.preventDefault();
    const step = (range[1] - range[0]) / (nBins - 1);

    const onMove = (ev: MouseEvent) => {
      const val = posToSnappedValue(ev.clientY);
      setSelectedRange((prev) => {
        const next: [number, number] =
          which === "top"
            ? [prev[0], Math.max(val, prev[0] + step)]
            : [Math.min(val, prev[1] - step), prev[1]];
        onRangeChange?.(next);
        return next;
      });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const topHandleTop = 100 - valueToPercent(selectedRange[1]);
  const bottomHandleTop = 100 - valueToPercent(selectedRange[0]);

  return (
    <div
      style={{ position: "relative", height: "100%", flex: 1, display: "flex" }}
    >
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minWidth: "3em",
          height: "100%",
          display: "flex",
          flexDirection: "column-reverse",
          gap: 0,
          textAlign: "center",
        }}
      >
        {bins.slice(0, -1).map((lower, i) => (
          <IntervalSegment
            key={i}
            topLabel={Math.round(bins[i + 1]).toString()}
            bottomLabel={i === 0 ? Math.round(lower).toString() : ""}
            nInside={
              values.filter((value) => bins[i] <= value && value < bins[i + 1])
                .length
            }
            isBottom={i === 0}
            isTop={i === bins.length - 2}
          />
        ))}
      </div>

      <div
        className="rangeHandle rangeHandle--top"
        style={{ top: `${topHandleTop}%` }}
        onMouseDown={startDrag("top")}
        title={`Upper bound: ${Math.round(selectedRange[1])}`}
      />

      <div
        className="rangeHandle rangeHandle--bottom"
        style={{ top: `${bottomHandleTop}%` }}
        onMouseDown={startDrag("bottom")}
        title={`Lower bound: ${Math.round(selectedRange[0])}`}
      />
    </div>
  );
}
