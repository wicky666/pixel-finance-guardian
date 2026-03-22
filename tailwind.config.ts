import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pixel: {
          success: "#55ff55",
          danger: "#ff5555",
          muted: "#aaaaaa",
          "page-bg": "#2d2d2d",
          "panel-bg": "#3d3d3d",
          border: "#555555",
          text: "#e0e0e0",
          "text-muted": "#aaaaaa",
          accent: "#55aaff",
        },
      },
      borderWidth: {
        pixel: "2px",
      },
      borderRadius: {
        pixel: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
