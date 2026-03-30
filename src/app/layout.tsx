import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KitchenLuxe | Elite Culinary Art & Designer Appliances",
  description: "Curated high-performance kitchen technology and designer tools for the modern gourmet chef.",
  verification: {
    google: "wnL49Tuf54VQIr6HH6XVw5pLTpq9O8rs8da7eEf401g",
    other: {
      "p:domain_verify": "04a7aaaa5353af3fdc4b3899f0dd3b03"
    }
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
