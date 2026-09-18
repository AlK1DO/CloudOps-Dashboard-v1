/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cloud: {
          bg: '#F8FAFC',
          sidebar: '#0F172A',
          primary: '#2563EB',
          security: '#16A34A',
          costs: '#F59E0B',
          alerts: '#DC2626',
          textPrimary: '#1E293B',
          textSecondary: '#64748B',
          border: '#E2E8F0',
          card: '#FFFFFF',
        },
      },
      borderRadius: {
        'card': '14px',
      },
    },
  },
  plugins: [],
}
