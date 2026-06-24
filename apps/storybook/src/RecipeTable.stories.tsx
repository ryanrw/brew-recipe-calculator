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
    text-align: left;
    font: inherit;
    color: inherit;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    padding: 0 16px;
    display: flex;
    align-items: center;
  }
  .cell-edit-trigger:hover { color: #F5E6D3; }
  .cell-edit-trigger:focus-visible {
    outline: 2px solid #C2410C;
    outline-offset: -2px;
  }
  .edited-tag {
    display: inline-block;
    margin-left: 8px;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #C2410C;
    background: rgba(194, 65, 12, 0.12);
    border: 1px solid rgba(194, 65, 12, 0.35);
    border-radius: 4px;
    vertical-align: middle;
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
        { key: "scale", label: "Scale reads" },
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
        { key: "scale", label: "Scale reads" },
        { key: "time", label: "At time" },
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
 * Previews the per-cell className hook used by the dashboard to mark pour
 * rows' "Add" cell as editable. Pour 1's "Add" cell is wrapped in a button
 * and carries the "edited" pill so designers can compare against the
 * un-edited baseline.
 */
export const WithEditedCell = {
  render: () => (
    <RecipeTable
      columns={[
        { key: "step", label: "Step" },
        { key: "add", label: "Add" },
        { key: "scale", label: "Scale reads" },
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
              85 g<span className="edited-tag">edited</span>
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
    />
  ),
};