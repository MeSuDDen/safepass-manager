import { mtConfig } from "@material-tailwind/react";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@material-tailwind/react/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Roboto", "sans-serif"],
            }
        }
    },
    plugins: [
        mtConfig({
            colors: {
                primary: {
                    default: "#212121",
                    light: "#575757",
                    foreground: "#FFF",
                    dark: "#000",
                },
            },
        }),
    ],
};
