import type { ReactNode } from "react";
import { tableStyle, tdStyle, thStyle } from "./index.css";

export interface RecipeTableProps {
  columns: { key: string; label: string }[];
  rows: { key: string; cells: ReactNode[] }[];
  caption?: string;
  /**
   * Optional hook so the host app can attach a className to individual cells
   * (e.g. tag the "Add" column as editable). Returning a string is appended to
   * the cell's className; returning null/undefined leaves the className empty.
   */
  getCellClassName?: (rowKey: string, columnKey: string) => string | undefined;
}

export function RecipeTable({
  columns,
  rows,
  caption,
  getCellClassName,
}: RecipeTableProps) {
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
            {r.cells.map((cell, i) => {
              const extra = getCellClassName?.(r.key, columns[i].key);
              return (
                <td
                  key={columns[i].key}
                  style={tdStyle}
                  className={extra}
                >
                  {cell}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
