import type { Metadata, Viewport } from "next";
import { Nunito, Baloo_2 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AppStoreProvider } from "@/lib/store/app-store";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "OmaGBT — your magical AI friend",
  description:
    "OmaGBT is a private, playful, and safe AI companion made just for one kid: chat, games, magic, stories, and learning.",
  applicationName: "OmaGBT",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${nunito.variable} ${baloo.variable}`}>
      <body className="min-h-full">
        <ThemeProvider>
          <AppStoreProvider>{children}</AppStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
