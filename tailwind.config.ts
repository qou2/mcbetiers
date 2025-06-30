
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
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
		extend: {
			screens: {
				'xs': '480px',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				tier: {
					1: "#FFD700", // Gold
					2: "#F97316", // Orange
					3: "#8B5CF6", // Purple
					4: "#1EAEDB", // Blue
					5: "#10B981", // Green
				},
				dark: {
					background: "#0f0f0f",
					surface: "#1A1F2C",
					border: "#2D3748",
					overlay: "#121212",
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'slide-in': {
					'0%': { transform: 'translateX(-10px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'glow-pulse': {
					'0%, 100%': { filter: 'brightness(1)' },
					'50%': { filter: 'brightness(1.2)' },
				},
				'border-glow': {
					'0%, 100%': { borderColor: 'rgba(255, 255, 255, 0.1)' },
					'50%': { borderColor: 'rgba(255, 255, 255, 0.3)' },
				},
				'staggered-fade': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-in': 'slide-in 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'glow-pulse': 'glow-pulse 3s infinite',
				'border-glow': 'border-glow 2s infinite',
				'staggered-fade-1': 'staggered-fade 0.8s ease-out 0.1s both',
				'staggered-fade-2': 'staggered-fade 0.8s ease-out 0.2s both',
				'staggered-fade-3': 'staggered-fade 0.8s ease-out 0.3s both',
				'staggered-fade-4': 'staggered-fade 0.8s ease-out 0.4s both',
				'staggered-fade-5': 'staggered-fade 0.8s ease-out 0.5s both',
			},
			boxShadow: {
				'glow-gold': '0 0 15px rgba(255, 215, 0, 0.5)',
				'glow-orange': '0 0 15px rgba(249, 115, 22, 0.5)',
				'glow-purple': '0 0 15px rgba(139, 92, 246, 0.5)',
				'glow-blue': '0 0 15px rgba(30, 174, 219, 0.5)',
				'glow-green': '0 0 15px rgba(16, 185, 129, 0.5)',
				'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'glass': '0 8px 32px rgba(0, 0, 0, 0.2)',
			},
			backgroundImage: {
				'gradient-dark': 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
				'gradient-radial': 'radial-gradient(circle at center, #1a1a1a 0%, #0f0f0f 70%)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
