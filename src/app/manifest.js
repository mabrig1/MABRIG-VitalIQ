export default function manifest() {
  return {
    name: "MABRIG VitalIQ",
    short_name: "VitalIQ",
    description: "Personal health intelligence for verified readings and trends.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f8fb",
    theme_color: "#071b2c",
    icons: [
      { src: "/vitaliq-icon.svg", sizes: "any", type: "image/svg+xml" }
    ]
  };
}
