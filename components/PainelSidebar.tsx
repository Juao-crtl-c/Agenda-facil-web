"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, CalendarDays, LogOut, Scissors } from "lucide-react";
import { limparSessao, type Usuario } from "@/lib/auth";

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
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface p-4">
      <p className="font-display px-2 text-lg font-semibold">Agenda Fácil</p>
      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {ITENS.map(({ href, label, icon: Icon }) => {
          const ativo = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors ${
                ativo ? "bg-accent-soft text-accent font-medium" : "text-ink-soft hover:bg-paper"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border pt-3">
        {usuario && <p className="truncate px-2 text-xs text-ink-soft">{usuario.nome}</p>}
        <button
          onClick={sair}
          className="mt-2 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-ink-soft hover:bg-paper"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
