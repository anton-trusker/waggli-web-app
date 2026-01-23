/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./context/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#7C5CFC',
                    light: '#9F87FD',
                    dark: '#5A37E6',
                },
                secondary: '#FFB020',
                background: {
                    light: '#F8FAFC',
                    dark: '#0F172A',
                },
                text: {
                    main: {
                        light: '#1E293B',
                        dark: '#F1F5F9',
                    },
                    muted: {
                        light: '#64748B',
                        dark: '#94A3B8',
                    }
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
