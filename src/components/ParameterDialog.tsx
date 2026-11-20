import { useEffect, useState } from "react";

/** An integer parameter of an action. */
export type NumberField = {
  key: string;
  label: string;
  min: number;
  max: number;
  default: number;
};

function isValid(value: string, field: NumberField): boolean {
  if (value.trim() === "") return false;
  const n = Number(value);
  return Number.isInteger(n) && field.min <= n && n <= field.max;
}

/**
 * Small modal dialog for the parameters of an action.
 *
 * Enter submits (if all values are valid), Esc cancels. The values are
 * integers within each field's range.
 */
export default function ParameterDialog({
  title,
  description,
  fields,
  submitLabel = "OK",
  onSubmit,
  onCancel,
}: {
  title: string;
  description?: string;
  fields: NumberField[];
  submitLabel?: string;
  onSubmit: (values: Record<string, number>) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, String(f.default)])),
  );
  const allValid = fields.every((f) => isValid(values[f.key] ?? "", f));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Don't let other Esc handlers (e.g. the action mode) see it.
        event.stopImmediatePropagation();
        onCancel();
      }
    };
    // Capture phase: runs before the handlers registered on `window`.
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [onCancel]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!allValid) return;
    onSubmit(
      Object.fromEntries(fields.map((f) => [f.key, Number(values[f.key])])),
    );
  }

  return (
    <div className="parameter-dialog-backdrop" onMouseDown={onCancel}>
      <form
        className="parameter-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="parameter-dialog-title">{title}</div>
        {description && (
          <div className="parameter-dialog-description">{description}</div>
        )}
        {fields.map((field, i) => (
          <label key={field.key} className="parameter-dialog-field">
            <span>
              {field.label} ({field.min}–{field.max})
            </span>
            <input
              type="number"
              min={field.min}
              max={field.max}
              step={1}
              value={values[field.key]}
              autoFocus={i === 0}
              onFocus={(event) => event.target.select()}
              aria-invalid={!isValid(values[field.key] ?? "", field)}
              onChange={(event) =>
                setValues((prev) => ({
                  ...prev,
                  [field.key]: event.target.value,
                }))
              }
            />
          </label>
        ))}
        <div className="parameter-dialog-buttons">
          <button type="button" className="action-button secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="action-button" disabled={!allValid}>
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
