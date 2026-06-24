import type { ReactNode } from "react";
import { tableStyle, tdStyle, thStyle } from "./index.css";

export interface RecipeTableProps {
  columns: { key: string; label: string }[];
  rows: { key: string; cells: ReactNode[] }[];
  caption?: string;
}

export function RecipeTable({ columns, rows, caption }: RecipeTableProps) {
  return (
    <table className="recipe-table" style={tableStyle}>
      {caption && (
        <caption style={{ captionSide: "top", paddingBottom: 8, fontSize: 13 }}>
          {caption}
        </caption>
      )}
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} style={thStyle}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key}>
            {r.cells.map((cell, i) => (
              <td key={columns[i].key} style={tdStyle}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
