import React from "react";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../components/theme-provider";
import Provider from "../components/provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Synced - Find Your Sound",
  description:
    "Discover music and connect with others through your taste in songs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Provider>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </Provider>
    </html>
  );
}
