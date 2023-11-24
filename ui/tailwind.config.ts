import daisyui from 'daisyui';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [daisyui],
  daisyui: {
    themes: ['light', 'dark', 'cupcake'],
  },
  theme: {
    extend: {
      fontFamily: {
        lalezar: ['"Lalezar"'], // logo
        popone: ['"Mochiy Pop One"'],
        prism: ['"Tilt Prism"'],
        teko: ['"Teko"'],
        qld: ['"Edu QLD Beginner"'],
        genos: ['"Genos"'],
        crisis: ['"Climate Crisis"'],
        tourney: ['"Tourney"'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'snowflakes-fall': 'snowflakes-fall 10s linear infinite',
        'snowflakes-shake': 'snowflakes-shake 3s ease-in-out infinite',
      },
      colors: {
        base: {
          // yellow
          '50': '#fefde8',
          '100': '#fefbc3',
          '200': '#fef38a',
          '300': '#fde547',
          '400': '#fad215',
          '500': '#eab908',
          '600': '#d59704',
          '700': '#a16607',
          '800': '#85500e',
          '900': '#714212',
          '950': '#422206',
        },
        accent: {
          // green
          '50': '#effef1',
          '100': '#dafedf',
          '200': '#b8fac2',
          '300': '#80f593',
          '400': '#41e65d',
          '500': '#19ce39',
          '600': '#0eab29',
          '700': '#0f8625',
          '800': '#126922',
          '900': '#11561f',
          '950': '#03300d',
        },
      },
    },
  },
};
export default config;
