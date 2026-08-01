/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta SAN BERNARDO (heredada de styles/style.css)
        brand: {
          green: '#006644',
          dark: '#004b33',
          beige: '#f9f1e6',
          beige2: '#fdf6ef',
          cream: '#f1e7da'
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Open Sans"', 'sans-serif']
      },
      boxShadow: {
        card: '0 4px 8px rgba(0,0,0,0.1)'
      }
    }
  },
  plugins: []
};

