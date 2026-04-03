import type { Metadata } from "next";
import { Lora, Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";
import "./globals.css";

const appSans = Plus_Jakarta_Sans({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const appMono = Roboto_Mono({
  variable: "--font-app-mono",
  subsets: ["latin"],
});

const appSerif = Lora({
  variable: "--font-app-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Equipment Management Dashboard",
  description: "Track inventory status and equipment bookings in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${appSans.variable} ${appMono.variable} ${appSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
