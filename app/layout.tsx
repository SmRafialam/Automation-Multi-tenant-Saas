import type { Metadata } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const hind = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AutoFlow — F-commerce Automation Suite",
  description:
    "এক জায়গা থেকে Facebook পোস্টিং, অর্ডার, কুরিয়ার আর কাস্টমার — F-commerce automation dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className={`${inter.variable} ${hind.variable} h-full`}>
      <body>{children}</body>
    </html>
  );
}
