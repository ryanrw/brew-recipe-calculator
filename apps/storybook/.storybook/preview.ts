import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [{ name: "light", value: "#f6f3ee" }],
    },
  },
};

export default preview;