import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { THEME_INIT_SCRIPT } from "@/components/ThemeToggle";

// Auto-hospedadas em vez de carregadas via <link> do Fontshare: a API deles
// serve URLs de fonte protocol-relative (`//cdn...`), que em dev (http://
// localhost, não https) resolvem pra http e caem num redirect 301 que quebra
// o carregamento — só funcionaria em produção (https). Baixar os arquivos
// evita essa pegadinha e qualquer dependência de rede em runtime.
const display = localFont({
  src: [
    { path: "./fonts/CabinetGrotesk-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/CabinetGrotesk-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: [
    { path: "./fonts/GeneralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/GeneralSans-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
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
