import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    server: {
    port: 1127
  },
  plugins: [tailwindcss(), react()],
  assetsInclude: ["**/*.png"]
});