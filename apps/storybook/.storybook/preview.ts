import type { Preview } from "@storybook/react";
import { useEffect, type ComponentType } from "react";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Sans+3:wght@400;600&family=Fira+Code:wght@400&display=swap";

/**
 * Inject Google Fonts into Storybook's <head> on mount. The web app's
 * index.html <link> only reaches the dashboard itself, so we re-attach
 * the stylesheet here so Playfair + Source Sans 3 load for stories too.
 */
const withFonts = (Story: ComponentType) => {
  useEffect(() => {
    if (document.querySelector(`link[data-ember-fonts]`)) return;
    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "anonymous";
    document.head.appendChild(preconnect2);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    link.dataset.emberFonts = "true";
    document.head.appendChild(link);
  }, []);
  return <Story />;
};

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "page",
      values: [
        { name: "page", value: "#1C1917" },
        { name: "surface", value: "#292524" },
        { name: "raised", value: "#44403C" },
      ],
    },
  },
  decorators: [withFonts],
};

export default preview;