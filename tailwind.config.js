/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './components/**/*.{ts,tsx}',
        './gallery-entry.tsx',
        './demo.tsx',
    ],
    theme: {
        extend: {
            fontFamily: {
                mono: ['PPSupplyMono', 'monospace'],
                sans: ['PP Neue Montreal', 'sans-serif'],
                display: ['Cormorant Garamond', 'serif'],
            },
        },
    },
    plugins: [],
};
