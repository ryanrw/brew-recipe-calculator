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