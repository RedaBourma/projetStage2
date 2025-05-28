import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: "class",
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		fontFamily: {
			'andalus': ['Andalus', 'Cairo', 'sans-serif'],
			'tajawal': ['Tajawal', 'Cairo', 'sans-serif'],
		},
		extend: {
			colors: {
				red: { DEFAULT: '#ea384c' },
				green: { DEFAULT: '#22b573' },
				blue: { DEFAULT: '#1EAEDB' },
				white: { DEFAULT: '#fff' },
				govbg: { DEFAULT: "#f6f7fa" },
				govcard: { DEFAULT: "#fff", dark: "#23314a" }
			},
			borderRadius: {
				lg: '1.2rem',
				md: '0.6rem',
				sm: '0.3rem'
			},
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				}
			},
			animation: {
				'fade-in': 'fade-in 0.7s cubic-bezier(.42,0,.58,1) both',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;