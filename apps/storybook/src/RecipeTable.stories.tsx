import { RecipeTable } from "@brew-recipe/ui";

export default {
  title: "Components/RecipeTable",
  component: RecipeTable,
  decorators: [
    (Story) => (
      <div style={{ padding: 16, maxWidth: 520, background: "#0f172a" }}>
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
