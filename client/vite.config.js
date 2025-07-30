import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [
      react({
        jsxRuntime: "automatic",
      }),
    ],

    // Test configuration
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.js"],
    },

    // Build configuration
    build: {
      // Production optimizations
      minify: isProduction ? "esbuild" : false,
      sourcemap: !isProduction,

      // Chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            vendor: ["react", "react-dom"],
            bootstrap: ["bootstrap", "react-bootstrap"],
            icons: ["lucide-react", "react-icons"],
            router: ["react-router", "react-router-dom"],
            utils: ["date-fns", "react-spinners"],
          },
          // Asset naming for better caching
          chunkFileNames: isProduction
            ? "assets/js/[name]-[hash].js"
            : "assets/js/[name].js",
          entryFileNames: isProduction
            ? "assets/js/[name]-[hash].js"
            : "assets/js/[name].js",
          assetFileNames: isProduction
            ? "assets/[ext]/[name]-[hash].[ext]"
            : "assets/[ext]/[name].[ext]",
        },
      },

      // Performance optimizations
      target: "es2020",
      cssCodeSplit: true,

      // Bundle size warnings
      chunkSizeWarningLimit:
        parseInt(process.env.VITE_CHUNK_SIZE_WARNING_LIMIT) || 1000,
    },

    // Development server configuration
    server: {
      port: 5173,
      host: true,
      cors: true,
      proxy: {
        "/api": {
          target: process.env.VITE_API_URL || "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Preview server configuration
    preview: {
      port: 4173,
      host: true,
    },

    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },

    // CSS configuration
    css: {
      devSourcemap: !isProduction,
      preprocessorOptions: {
        scss: {
          additionalData: `@import "bootstrap/scss/functions"; @import "bootstrap/scss/variables";`,
        },
      },
    },

    // Optimization configuration
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "bootstrap",
        "react-bootstrap",
      ],
    },

    // Base URL for deployment
    base: "/",
  };
});
