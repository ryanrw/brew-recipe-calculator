import { useState } from "react";
import { Picker } from "@brew-recipe/ui";

export default {
  title: "Components/Picker",
  component: Picker,
  argTypes: {
    min: { control: { type: "number" } },
    max: { control: { type: "number" } },
    step: { control: { type: "number" } },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 24,
          maxWidth: 280,
          background: "#f6f3ee",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const CoffeeGrams = {
  args: { min: 8, max: 25, step: 1 },
  render: (args) => {
    const [v, setV] = useState(15);
    return <Picker {...args} value={v} onChange={setV} />;
  },
};

export const Ratio = {
  args: { min: 2, max: 20, step: 0.5 },
  render: (args) => {
    const [v, setV] = useState(17.5);
    return (
      <Picker {...args} value={v} onChange={setV} format={(n) => n.toFixed(1)} />
    );
  },
};

/** Side-by-side: same picker at different values, to make the perspective
 *  tilt and scale differences between rows obvious. */
export const Comparison = {
  render: () => {
    const [a, setA] = useState(12);
    const [b, setB] = useState(20);
    return (
      <div style={{ display: "flex", gap: 16 }}>
        <Picker min={8} max={25} value={a} onChange={setA} />
        <Picker min={8} max={25} value={b} onChange={setB} />
      </div>
    );
  },
};
