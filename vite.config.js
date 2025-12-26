import { defineConfig } from 'vite';
import path from 'path';
import viteImagemin from 'vite-plugin-imagemin';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => ({
    base: mode === 'production' ? '/ORDINA.github.io/' : '/',
    plugins: [
        viteImagemin({
            gifsicle: {
                optimizationLevel: 7,
                interlaced: false,
            },
            optipng: {
                optimizationLevel: 7,
            },
            mozjpeg: {
                quality: 85,
            },
            pngquant: {
                quality: [0.8, 0.9],
                speed: 4,
            },
            svgo: {
                plugins: [
                    {
                        name: 'removeViewBox',
                        active: false,
                    },
                    {
                        name: 'removeEmptyAttrs',
                        active: true,
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false, // Disable sourcemaps in production for smaller bundle
        minify: 'terser', // Use terser for better minification
        terserOptions: {
            compress: {
                drop_console: true, // Remove console.logs in production
                drop_debugger: true, // Remove debugger statements
                pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
            },
            format: {
                comments: false, // Remove comments
            },
        },
        rollupOptions: {
            output: {
                // Manual chunks for better code splitting
                manualChunks(id) {
                    // Separate Firebase into its own chunk
                    if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
                        return 'vendor-firebase';
                    }
                    // Separate other node_modules into vendor chunk
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                },
                // Optimize chunk file names
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
                // Compact output for smaller file sizes
                compact: true,
            },
            // Tree-shaking optimizations (preserve Firebase side effects)
            treeshake: {
                moduleSideEffects: (id) => {
                    // Preserve side effects for Firebase modules
                    return id.includes('firebase') || id.includes('@firebase');
                },
            },
        },
        // Chunk size warning limit
        chunkSizeWarningLimit: 600,
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Optimize assets
        assetsInlineLimit: 4096, // Inline assets smaller than 4kb
        // Enable tree-shaking
        target: 'es2015',
        // Optimize dependencies
        commonjsOptions: {
            include: [/node_modules/],
            transformMixedEsModules: true,
        },
    },
    // Optimize dependencies pre-bundling
    optimizeDeps: {
        include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        exclude: [],
        esbuildOptions: {
            // Optimize esbuild for smaller bundles
            target: 'es2015',
            minify: true,
        },
    },
    server: {
        port: 3000,
        open: true,
        hmr: {
            clientPort: 3000,
        },
    },
}));
