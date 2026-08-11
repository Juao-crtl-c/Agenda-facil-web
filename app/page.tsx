import Link from "next/link";
import { CalendarCheck, Clock, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 text-center">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-accent">Vianova Dev</p>
      <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Agenda Fácil</h1>
      <p className="mx-auto mt-4 max-w-xl text-ink-soft">
        Chega de marcar horário pelo WhatsApp e perder o controle da agenda. Seus clientes marcam
        sozinhos, você recebe tudo organizado.
      </p>

      <div className="mt-8 flex justify-center gap-3">
        <Link href="/cadastro" className="btn-accent">
          Criar minha agenda grátis
        </Link>
        <Link href="/entrar" className="btn-outline">
          Já tenho conta
        </Link>
      </div>

      <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
        <div className="card p-5">
          <CalendarCheck className="mb-2 h-5 w-5 text-accent" />
          <p className="text-sm font-medium">Página própria</p>
          <p className="mt-1 text-xs text-ink-soft">
            Um link só seu, onde o cliente escolhe serviço, dia e horário sem precisar criar conta.
          </p>
        </div>
        <div className="card p-5">
          <ShieldCheck className="mb-2 h-5 w-5 text-accent" />
          <p className="text-sm font-medium">Sem horário duplicado</p>
          <p className="mt-1 text-xs text-ink-soft">
            O sistema bloqueia automaticamente horários já ocupados, mesmo com dois clientes ao
            mesmo tempo.
          </p>
        </div>
        <div className="card p-5">
          <Clock className="mb-2 h-5 w-5 text-accent" />
          <p className="text-sm font-medium">Cancelamento fácil</p>
          <p className="mt-1 text-xs text-ink-soft">
            O cliente recebe um link único pra cancelar ou remarcar sem te ligar.
          </p>
        </div>
      </div>
    </main>
  );
}
