import { useState } from "react";
import { Toggle } from "@brew-recipe/ui";

export default {
  title: "Components/Toggle",
  component: Toggle,
  argTypes: {
    checked: { control: { type: "boolean" } },
    label: { control: { type: "text" } },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 24, background: "#0f172a", color: "#e2e8f0" }}>
        <Story />
      </div>
    ),
  ],
};

export const Off = {
  args: { checked: false, label: "Include advanced timing" },
  render: (args) => {
    const [on, setOn] = useState(args.checked);
    return <Toggle {...args} checked={on} onChange={setOn} />;
  },
};

export const On = {
  args: { checked: true, label: "Include advanced timing" },
  render: (args) => {
    const [on, setOn] = useState(args.checked);
    return <Toggle {...args} checked={on} onChange={setOn} />;
  },
};
