import "./globals.css";

export const metadata = {
  title: "MABRIG VitalIQ | Personal Health Intelligence",
  description: "Understand glucose, blood pressure, pulse and oxygen trends from verified health readings.",
  applicationName: "MABRIG VitalIQ",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071b2c",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
