import { Outfit, Syne, Pixelify_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixelify",
});

export const metadata = {
  title: "Tech Resume System",
  description: "Designed for workplace teams",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} ${syne.variable} ${pixelify.variable}`}>
        {children}
      </body>
    </html>
  );
}
