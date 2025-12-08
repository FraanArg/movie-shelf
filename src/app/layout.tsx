import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import BackdropProvider from "@/components/BackdropProvider";
import XRayProvider from "@/components/XRayProvider";
import SearchOverlay from "@/components/SearchOverlay";
import FloatingActionButton from "@/components/FloatingActionButton";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import OfflineIndicator from "@/components/OfflineIndicator";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });

export const metadata: Metadata = {
  title: "Movie Shelf",
  description: "Your personal movie and TV show collection.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Movie Shelf",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://api.trakt.tv" />
          <link rel="preconnect" href="https://www.omdbapi.com" />
          <link rel="preconnect" href="https://api.themoviedb.org" />
          <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://m.media-amazon.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://api.trakt.tv" />
          <link rel="dns-prefetch" href="https://www.omdbapi.com" />
          <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        </head>
        <body className={`${inter.variable} ${oswald.variable} ${inter.className}`}>
          <ConvexClientProvider>
            <ThemeProvider
              attribute="data-theme"
              defaultTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
              <BackdropProvider>
                <XRayProvider>
                  <Header />
                  <SearchOverlay />
                  <FloatingActionButton />
                  <KeyboardShortcuts />
                  <OfflineIndicator />
                  {children}
                  <BottomNav />
                </XRayProvider>
              </BackdropProvider>
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
