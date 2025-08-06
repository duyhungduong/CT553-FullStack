import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    // Enable CORS for development
    cors: true,
  },
  // Build optimizations
  build: {
    // Generate sourcemaps for better debugging in production
    sourcemap: false,
    // Target modern browsers for smaller bundle size
    target: 'esnext',
    // Optimize bundle splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          'chart-vendor': ['recharts'],
          'utils-vendor': ['lodash', 'date-fns', 'clsx']
        }
      }
    },
    // Optimize assets
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Preview config for production builds
  preview: {
    port: 3000,
    host: true,
  },
  // Dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'axios',
      'zustand',
      '@clerk/clerk-react',
    ],
    exclude: [
      // Large packages that should be loaded asynchronously
      'essentia.js',
    ]
  },
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  }
})
