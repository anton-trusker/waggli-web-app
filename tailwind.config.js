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
                    hover: '#6b4ce6',
                },
                'primary-hover': '#6b4ce6',
                secondary: '#FF8080',
                accent: '#26C6DA',
                background: {
                    light: '#F3F4F6',
                    dark: '#111827',
                },
                surface: {
                    light: '#FFFFFF',
                    dark: '#1F2937',
                },
                text: {
                    main: {
                        light: '#1F2937',
                        dark: '#F9FAFB',
                    },
                    muted: {
                        light: '#6B7280',
                        dark: '#9CA3AF',
                    }
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                '3xl': '1.5rem',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pop-in': 'pop-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'pop-in': {
                    '0%': { opacity: '0', transform: 'scale(0.5)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                }
            }
        },
    },
    plugins: [],
}
