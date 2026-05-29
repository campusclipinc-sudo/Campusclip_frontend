import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "dist/stats.html",
    }),
  ],
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Optimize rollup output
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching - avoid circular deps
        manualChunks(id) {
          // Vendor chunks
          if (id.includes("node_modules/react")) {
            return "react";
          }
          if (id.includes("node_modules/redux")) {
            return "redux";
          }
          if (id.includes("node_modules/@tanstack/react-query")) {
            return "query";
          }
          if (id.includes("node_modules/@stripe")) {
            return "stripe";
          }
          if (id.includes("node_modules/@fortawesome")) {
            return "icons";
          }
          if (
            id.includes("node_modules/axios") ||
            id.includes("node_modules/date-fns") ||
            id.includes("node_modules/formik") ||
            id.includes("node_modules/yup") ||
            id.includes("node_modules/socket.io-client") ||
            id.includes("node_modules/react-toastify") ||
            id.includes("node_modules/react-confirm-alert") ||
            id.includes("node_modules/react-helmet-async")
          ) {
            return "utils";
          }
        },
      },
    },

    // CSS optimization with default minifier
    cssCodeSplit: true,

    // JavaScript minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    // Source maps only in dev
    sourcemap: false,

    // Optimize dependencies
    target: "esnext",

    // Report compressed size
    reportCompressedSize: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "redux",
      "react-redux",
      "@reduxjs/toolkit",
      "redux-persist",
      "@tanstack/react-query",
      "axios",
      "date-fns",
      "formik",
    ],
    exclude: ["firebase"],
  },
});
