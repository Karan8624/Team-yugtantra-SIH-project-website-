import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/lib/locale";
import { TelemetryProvider } from "@/lib/telemetry";
import "./globals.css";

// Fonts: using the system font stack (defined in globals.css) rather than
// next/font/google, so `next build` never depends on reaching Google's
// font CDN. Once the team is building outside a restricted network, swap
// in next/font/google (Space Grotesk + IBM Plex Mono, to match the
// approved mockups) or next/font/local with self-hosted files — the
// --font-sans / --font-mono CSS variables in globals.css are already the
// hook point, nothing else needs to change.

export const metadata: Metadata = {
  title: "AMR Fleet Control",
  description: "Control hub and live status display for the AMR warehouse fleet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LocaleProvider>
            <TelemetryProvider>{children}</TelemetryProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
