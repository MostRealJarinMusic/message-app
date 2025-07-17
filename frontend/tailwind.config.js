import PrimeUI from "tailwindcss-primeui";
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        layout: "8rem 1px 18rem 1fr 1px 14rem",
        // Servers | | Channels | | Chat | Users
      },
      gridTemplateRows: {
        layout: "3.5rem 1px 1fr",
        // Title bars | Main content
      },
    },
  },
  plugins: [PrimeUI],
};
