import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "800"] });

export const metadata = {
  title: "QueryFlow AI",
  description: "app to demonstrate voice/text-to-SQL capabilities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}
    nighteye="disabled">
      <body>{children}</body>
    </html>
  );
}