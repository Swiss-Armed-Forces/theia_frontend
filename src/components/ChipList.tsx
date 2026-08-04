export default function ChipList({
  keys,
  hiddenKeys,
  onToggle,
  color,
}: {
  keys: string[];
  hiddenKeys: Set<string>;
  onToggle: (key: string) => void;
  color: string;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {keys.map((key) => {
        const active = !hiddenKeys.has(key);
        return (
          <button
            key={key}
            aria-pressed={active}
            onClick={() => onToggle(key)}
            style={{
              border: `1px solid ${color}`,
              borderRadius: 999,
              padding: "3px 10px",
              fontSize: 12,
              fontFamily: "inherit",
              cursor: "pointer",
              background: active ? color : "transparent",
              color: active ? "var(--panel-bg)" : "var(--text)",
              opacity: active ? 1 : 0.6,
              transition: "background 0.12s, opacity 0.12s",
            }}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
