import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Agenda Fácil",
  description: "Agendamento online para negócios locais, sem complicação.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} font-body bg-paper text-ink antialiased flex min-h-screen flex-col`}
      >
        <div className="flex-1">{children}</div>
        <footer className="border-t border-border py-6 text-center text-xs text-ink-soft">
          desenvolvido por <span className="brand-text font-semibold">Vianova Dev</span>
        </footer>
      </body>
    </html>
  );
}
