/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        backgroundSecondary: 'hsl(var(--background-secondary))',
        primary: 'hsl(var(--primary))',
        primaryHover: 'hsl(var(--primary-hover))',
        secondary: 'hsl(var(--secondary))',
        text: 'hsl(var(--text))',
        destructive: 'hsl(var(--destructive))',
        textDestructive: 'hsl(var(--background))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        ring: 'hsl(var(--success))',
        cardBackground: 'hsl(var(--card-background))',
        cardBorder: 'hsl(var(--card-border)',
        inputBackground: 'hsl(var(--input-background)',
        inputBorder: 'hsl(var(--input-border)',
        inputText: 'hsl(var(--input-text)',
        inputPlaceholder: 'hsl(var(--input-placeholder)',
      },
    },
  },
  plugins: [],
  // Ensure all utilities are enabled
  corePlugins: {
    preflight: true,
  },
};
