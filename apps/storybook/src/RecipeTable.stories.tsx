import { RecipeTable } from "@brew-recipe/ui";

const tableCss = `
  .recipe-table {
    width: 100%;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
    background: #292524;
    border: 1px solid #3F3A36;
    border-radius: 12px;
    overflow: hidden;
    font-family: "Source Sans 3", system-ui, sans-serif;
  }
  .recipe-table thead th {
    text-align: left;
    padding: 12px 16px;
    background: #44403C;
    border-bottom: 1px solid #3F3A36;
    font-family: "Source Sans 3", system-ui, sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #A8A29E;
  }
  .recipe-table tbody td {
    padding: 12px 16px;
    border-bottom: 1px solid #3F3A36;
    font-size: 15px;
    color: #FAFAF9;
  }
  .recipe-table tbody tr:last-child td { border-bottom: 0; }
  /* Editable cell preview (mirrors apps/web/src/styles.css) */
  .recipe-table tbody td.recipe-table__cell--editable {
    position: relative;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .recipe-table tbody td.recipe-table__cell--editable:hover {
    background: rgba(194, 65, 12, 0.10);
  }
  .cell-edit-trigger {
    position: absolute;
    inset: 0;
    background: transparent;
    border: 0;
    text-align: center;
    font: inherit;
    color: inherit;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    white-space: nowrap;
  }
  .cell-edit-trigger:hover { color: #F5E6D3; }
  .cell-edit-trigger:focus-visible {
    outline: 2px solid #C2410C;
    outline-offset: -2px;
  }
  /* Edited-row highlight: terracotta tint + accent border, mirrors
     apps/web/src/styles.css. The host app supplies the className via
     RecipeTable's getRowClassName hook. */
  .recipe-table tbody tr.recipe-table__row--edited td {
    background: rgba(194, 65, 12, 0.10);
  }
  .recipe-table tbody tr.recipe-table__row--edited td:first-child {
    border-left: 3px solid #C2410C;
    padding-left: 13px;
  }
  .recipe-table tbody tr.recipe-table__row--edited td:last-child {
    border-right: 3px solid #C2410C;
    padding-right: 13px;
  }
`;

export default {
  title: "Components/RecipeTable",
  component: RecipeTable,
  decorators: [
    (Story) => (
      <div style={{ padding: 16, maxWidth: 520, background: "#1C1917" }}>
        <style>{tableCss}</style>
        <Story />
      </div>
    ),
  ],
};

export const Default = {
  render: () => (
    <RecipeTable
      columns={[
        { key: "step", label: "Step" },
        { key: "add", label: "Add" },
        { key: "scale", label: "Total" },
      ]}
      rows={[
        { key: "b", cells: ["Bloom", "30 g", "30 g"] },
        { key: "p1", cells: ["Pour 1", "36.25 g", "66.25 g"] },
        { key: "p2", cells: ["Pour 2", "36.25 g", "102.5 g"] },
      ]}
    />
  ),
};

export const WithTiming = {
  render: () => (
    <RecipeTable
      columns={[
        { key: "step", label: "Step" },
        { key: "add", label: "Add" },
        { key: "scale", label: "Total" },
        { key: "time", label: "Time (est.)" },
      ]}
      rows={[
        { key: "b", cells: ["Bloom", "30 g", "30 g", "45s"] },
        { key: "p1", cells: ["Pour 1", "36.25 g", "66.25 g", "78.75s"] },
        { key: "p2", cells: ["Pour 2", "36.25 g", "102.5 g", "112.5s"] },
      ]}
    />
  ),
};

/**
 * Previews the per-cell + per-row className hooks used by the dashboard.
 * The "Add" cells of pour rows are wrapped in a button (editable), and
 * Pour 1's row carries `recipe-table__row--edited` so the whole row gets
 * the terracotta tint and accent border. Pour 2 stays un-edited for
 * comparison.
 */
export const WithEditedCell = {
  render: () => (
    <RecipeTable
      columns={[
        { key: "step", label: "Step" },
        { key: "add", label: "Add" },
        { key: "scale", label: "Total" },
      ]}
      rows={[
        {
          key: "bloom",
          cells: ["Bloom", "30 g", "30 g"],
        },
        {
          key: "pour-1",
          cells: [
            "Pour 1",
            <button key="p1-add" type="button" className="cell-edit-trigger">
              85 g
            </button>,
            "115 g",
          ],
        },
        {
          key: "pour-2",
          cells: [
            "Pour 2",
            <button key="p2-add" type="button" className="cell-edit-trigger">
              55 g
            </button>,
            "170 g",
          ],
        },
      ]}
      getCellClassName={(rowKey, columnKey) =>
        columnKey === "add" && rowKey !== "bloom"
          ? "recipe-table__cell--editable"
          : undefined
      }
      getRowClassName={(rowKey) =>
        rowKey === "pour-1" ? "recipe-table__row--edited" : undefined
      }
    />
  ),
};