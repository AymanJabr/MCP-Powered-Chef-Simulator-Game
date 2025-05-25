import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css'; // Import Mantine core styles

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "MCP-Powered Chef Simulator", // Reverted title
  description: "A dynamic chef simulation game with MCP integration.", // Reverted description
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    images: '/logo.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
      </head>
      <body className={inter.className}> {/* Reverted className */}
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
