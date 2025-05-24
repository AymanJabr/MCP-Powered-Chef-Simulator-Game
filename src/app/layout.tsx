import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css'; // Import Mantine core styles

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MCP Powered Chef Simulator", // Updated title
  description: "A game showcasing manual vs MCP-assisted gameplay.", // Updated description
};

// Basic theme for Mantine (can be customized later)
const theme = createTheme({
  // Add any theme overrides here
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
