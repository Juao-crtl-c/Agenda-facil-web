"use client";

import Link from "next/link";
import { usePainel } from "@/lib/painel-context";

export default function PainelOverviewPage() {
  const { negocio } = usePainel();

  const linkPublico = negocio ? `${typeof window !== "undefined" ? window.location.origin : ""}/${negocio.slug}` : "";

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-xl font-semibold">Olá, {negocio?.nome}</h1>
      <p className="mt-1 text-sm text-ink-soft">Esse é o link que seus clientes usam pra marcar horário.</p>

      <div className="card-glass mt-4 flex items-center justify-between gap-3 p-4">
        <code className="tabular truncate text-sm">{linkPublico}</code>
        <button
          onClick={() => navigator.clipboard.writeText(linkPublico)}
          className="btn-outline shrink-0 text-xs"
        >
          Copiar link
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link href="/painel/agenda" className="card p-4 text-sm transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-glow-sm">
          <p className="font-medium">Ver agenda</p>
          <p className="mt-1 text-xs text-ink-soft">Agendamentos e bloqueios</p>
        </Link>
        <Link href="/painel/servicos" className="card p-4 text-sm transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-glow-sm">
          <p className="font-medium">Serviços</p>
          <p className="mt-1 text-xs text-ink-soft">Nome, duração e preço</p>
        </Link>
        <Link href="/painel/negocio" className="card p-4 text-sm transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-glow-sm">
          <p className="font-medium">Configurações</p>
          <p className="mt-1 text-xs text-ink-soft">Nome e horário de funcionamento</p>
        </Link>
      </div>
    </div>
  );
}
