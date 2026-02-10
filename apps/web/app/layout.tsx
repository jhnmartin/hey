import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { ViewSwitcher } from "@/components/view-switcher";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.heythursday.app"),
  title: {
    default: "hey thursday",
    template: "%s | hey thursday",
  },
  description:
    "We take the guesswork out of nightlife. Discover the best events near you.",
  keywords: ["nightlife", "events", "discover", "hey thursday"],
  authors: [{ name: "hey thursday" }],
  creator: "hey thursday",
  alternates: {
    canonical: "https://www.heythursday.app",
  },
  openGraph: {
    type: "website",
    siteName: "hey thursday",
    title: "hey thursday",
    description:
      "We take the guesswork out of nightlife. Discover the best events near you.",
    url: "https://www.heythursday.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "hey thursday",
    description:
      "We take the guesswork out of nightlife. Discover the best events near you.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "hey thursday",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            {children}
            <ViewSwitcher />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
