/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#f8f5ee",
        linen: "#eee6d9",
        charcoal: "#1d1d1b",
        softblack: "#11110f",
        stone: "#6f6a61",
        sage: "#6f8f82",
        brass: "#b6905b",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(29, 29, 27, 0.08)",
      },
    },
  },
  plugins: [],
};
