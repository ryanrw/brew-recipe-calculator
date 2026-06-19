import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "night",
      values: [
        { name: "night", value: "#0f172a" },
        { name: "light", value: "#f6f3ee" },
      ],
    },
  },
};

export default preview;