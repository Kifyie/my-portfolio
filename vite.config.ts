import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        dedupe: ['three'],
    },
    server: {
        open: false,
    },
    build: {
        outDir: 'dist',
        target: 'es2020',
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                gallery_bundle: path.resolve(__dirname, 'src/gallery-entry.tsx')
            },
            output: {
                entryFileNames: '[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-three': ['three'],
                    'vendor-drei': ['@react-three/drei'],
                    'vendor-fiber': ['@react-three/fiber'],
                    'vendor-motion': ['framer-motion'],
                },
            },
        },
        cssCodeSplit: true,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                passes: 2,
            },
            mangle: true,
        },
        reportCompressedSize: true,
        sourcemap: false,
    },
});
