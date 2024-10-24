import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/presentation/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      brand: {
        100: "#ffdddd",
        200: "#ffc0c0",
        300: "#ff9494",
        400: "#ff5757",
        500: "#ff2323",
        600: "#d70000",
        700: "#b10303",
        800: "#920A0A",
        900: "#500000",
      },
      neutral: {
        0: "#ffffff",
        50: "#F9F9FA",
        100: "#F5F5F6",
        200: "#E6E6E7",
        300: "#CFCFD2",
        400: "#AEADB3",
        500: "#85848C",
        600: "#6A6971",
        700: "#5B5A60",
        800: "#4D4C51",
        900: "#444347",
        1000: "#363538",
      },
      dark: {
        100: "#2C2C2E",
        200: "#202021",
        300: "#161618",
      },
      green: {
        100: "#DFF9E2",
        200: "#C1F1C7",
        300: "#91E49B",
        400: "#5ACE69",
        500: "#33B444",
        600: "#28A138",
        700: "#20752C",
        800: "#1B4C22",
        900: "#092A0F",
      },
      yellow: {
        100: "#FFFDC5",
        200: "#FFFA87",
        300: "#FFF148",
        400: "#FFE31E",
        500: "#FCC404",
        600: "#E69D00",
        700: "#b96d04",
        800: "#b96d04",
        900: "#b96d04",
      },
      orange: {
        100: "#FFEDD3",
        200: "#FFD8A5",
        300: "#FFBB6D",
        400: "#FF9232",
        500: "#FF720A",
        600: "#F05906",
        700: "#C74207",
        800: "#cc3e02",
        900: "#cc3e02",
      },
      blue: {
        100: "#E0EFFE",
        200: "#BADFFD",
        300: "#7CC6FD",
        400: "#37AAF9",
        500: "#0D8FEA",
        600: "#0172CB",
        700: "#0259A2",
        800: "#0B406F",
        900: "#082849",
      },
      transparent: "transparent",
    },
    screens: {
      sm: "30em", // 480px
      md: "48em", // 768px
      lg: "62em", // 992px
      xl: "80em", // 1280px
      "2xl": "96em", // 1536px
      "3xl": "120em", // 1920px
    },
    spacing: {
      px: "1px",
      0: "0",
      1: "0.25rem", // 4px
      2: "0.5rem", // 8px
      3: "0.75rem", // 12px
      4: "1rem", // 16px
      5: "1.25rem", // 20px
      6: "1.5rem", // 24px
      7: "1.75rem", // 28px
      8: "2rem", // 32px
      9: "2.25rem", // 36px
      10: "2.5rem", // 40px
      11: "2.75rem", // 44px
      12: "3rem", // 48px
      14: "3.5rem", // 56px
      16: "4rem", // 64px
      20: "5rem", // 80px
      24: "6rem", // 96px
      28: "7rem", // 112px
      32: "8rem", // 128px
      36: "9rem", // 144px
      40: "10rem", // 160px
      44: "11rem", // 176px
      48: "12rem", // 192px
      52: "13rem", // 208px
      56: "14rem", // 224px
      60: "15rem", // 240px
      64: "16rem", // 256px
      72: "18rem", // 288px
      80: "20rem", // 320px
      88: "22rem", // 352px
      96: "24rem", // 384px
    },
    borderRadius: {
      none: "0",
      sm: "0.3125rem", // 5px
      md: "0.625rem", // 10px
      lg: "0.9375rem", // 15px
      all: "50%",
    },
    lineHeight: {
      none: "1",
      tight: "1.2",
      normal: "1.5",
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
