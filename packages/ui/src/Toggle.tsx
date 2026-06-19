import { toggleThumb, toggleTrack } from "./index.css";

export interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      <span
        id={id}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        style={{
          ...toggleTrack,
          background: checked ? "#38bdf8" : toggleTrack.background,
        }}
      >
        <span
          style={{
            ...toggleThumb,
            left: checked ? 22 : 2,
          }}
        />
      </span>
      {label}
    </label>
  );
}
