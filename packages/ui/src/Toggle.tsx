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
        gap: 10,
        cursor: "pointer",
        fontFamily: '"Source Sans 3", system-ui, sans-serif',
        fontSize: 14,
        fontWeight: 600,
        color: "#FAFAF9",
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
          background: checked ? "#F59E0B" : toggleTrack.background,
          borderColor: checked ? "#F59E0B" : "#3F3A36",
          boxShadow: checked ? "0 0 12px rgba(245, 158, 11, 0.45)" : "none",
        }}
      >
        <span
          style={{
            ...toggleThumb,
            left: checked ? 22 : 2,
            background: checked ? "#1C1917" : "#A8A29E",
          }}
        />
      </span>
      {label}
    </label>
  );
}