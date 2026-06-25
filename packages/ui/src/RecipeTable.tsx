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
  /**
   * Optional hook so the host app can attach a className to the row's <tr>
   * (e.g. tag a row as "edited" so the whole row can be highlighted). Same
   * shape as getCellClassName; returning null/undefined leaves the row
   * unclassed.
   */
  getRowClassName?: (rowKey: string) => string | undefined;
}

export function RecipeTable({
  columns,
  rows,
  caption,
  getCellClassName,
  getRowClassName,
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
        {rows.map((r) => {
          const rowClass = getRowClassName?.(r.key);
          return (
            <tr key={r.key} className={rowClass}>
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
          );
        })}
      </tbody>
    </table>
  );
}
