import React from "react";
import { useSettings } from "../hooks/useSettings";

export type ButtonGroupColor = "default" | "purple" | "teal" | "coral" | "blue";

export interface ButtonGroupOption {
  label: string;
  value: string;
}

export interface ButtonGroupProps {
  options: (string | ButtonGroupOption)[];
  value: string;
  onChange: (value: string) => void;
}

const styles = {
  group: {
    display: "inline-flex",
    borderRadius: 4,
  } satisfies React.CSSProperties,

  button: (
    active: boolean,
    isFirst: boolean,
    isLast: boolean,
  ): React.CSSProperties => ({
    minWidth: "4em",
    minHeight: "3em",
    position: "relative",
    border: "1px solid var(--grp-border)",
    background: active ? "var(--grp-active-bg)" : "transparent",
    color: active ? "var(--grp-active-text)" : "var(--grp-text)",
    borderColor: active ? "var(--grp-active-border)" : "var(--grp-border)",
    cursor: "pointer",
    padding: "7px 16px",
    fontSize: 13,
    fontFamily: "inherit",
    fontWeight: active ? 500 : 400,
    letterSpacing: "0.03em",
    marginLeft: isFirst ? 0 : -1,
    borderRadius:
      isFirst && isLast
        ? 4
        : isFirst
          ? "4px 0 0 4px"
          : isLast
            ? "0 4px 4px 0"
            : 0,
    transition: "background 0.12s, color 0.12s",
    outline: "none",
    whiteSpace: "nowrap",
    zIndex: active ? 2 : 0,
  }),
};

export function ButtonGroup({
  options,
  value,
  onChange,
}: ButtonGroupProps) {
  const normalised = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt,
  );

  const {settings} = useSettings();

  const themeVars = {
    "--grp-border": settings.borderColor,
    "--grp-text": "inherit",
    "--grp-hover-bg": settings.primaryMuted,
    "--grp-focus": "var(--primary)",
    "--grp-active-bg": "var(--primary)",
    "--grp-active-text": "inherit",
    "--grp-active-border": "rgba(0,0,0,0.23)",
  }

  return (
    <div role="group" style={{ ...styles.group, ...themeVars }}>
      {normalised.map((opt, i) => {
        const active = opt.value === value;
        const isFirst = i === 0;
        const isLast = i === normalised.length - 1;

        return (
          <button
            key={opt.value}
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            style={styles.button(active, isFirst, isLast)}
            onMouseEnter={(e) => {
              if (!active)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--grp-hover-bg)";
            }}
            onMouseLeave={(e) => {
              if (!active)
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default ButtonGroup;
