import { RecipeTable } from "@brew-recipe/ui";

export default {
  title: "Components/RecipeTable",
  component: RecipeTable,
};

export const Default = () => (
  <div style={{ padding: 16 }}>
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
  </div>
);