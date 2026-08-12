"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, CalendarDays, LogOut, Scissors } from "lucide-react";
import { limparSessao, type Usuario } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";

const ITENS = [
  { href: "/painel/negocio", label: "Negócio", icon: Building2 },
  { href: "/painel/servicos", label: "Serviços", icon: Scissors },
  { href: "/painel/agenda", label: "Agenda", icon: CalendarDays },
];

export default function PainelSidebar({ usuario }: { usuario: Usuario | null }) {
  const pathname = usePathname();
  const router = useRouter();

  function sair() {
    limparSessao();
    router.push("/entrar");
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-surface p-3 md:h-screen md:w-56 md:border-b-0 md:border-r md:p-4 md:sticky md:top-0">
      <div className="flex items-center justify-between">
        <p className="font-display brand-text px-1 text-lg font-semibold md:px-2">Agenda Fácil</p>
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={sair}
            title="Sair"
            className="flex items-center gap-2 rounded-sm p-2 text-ink-soft hover:bg-accent-soft"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      <nav className="mt-3 flex gap-1 overflow-x-auto md:mt-6 md:flex-1 md:flex-col md:overflow-visible">
        {ITENS.map(({ href, label, icon: Icon }) => {
          const ativo = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-2 rounded-sm px-3 py-2 text-sm transition-all ${
                ativo ? "bg-accent-soft text-accent-dark font-medium shadow-glow-sm" : "text-ink-soft hover:bg-accent-soft/60"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="hidden border-t border-border pt-3 md:block">
        {usuario && <p className="truncate px-2 text-xs text-ink-soft">{usuario.nome}</p>}
        <div className="mt-2 flex items-center gap-1">
          <button
            onClick={sair}
            className="flex flex-1 items-center gap-2 rounded-sm px-3 py-2 text-sm text-ink-soft hover:bg-paper"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
