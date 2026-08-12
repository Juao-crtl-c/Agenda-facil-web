import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import type { Negocio } from "@/lib/types";
import FluxoAgendamento from "@/components/FluxoAgendamento";
import ThemeToggle from "@/components/ThemeToggle";

export default async function NegocioPublicoPage({ params }: { params: { slug: string } }) {
  let negocio: Negocio;
  try {
    negocio = await apiFetch<Negocio>(`/negocios/${params.slug}`, { auth: false, cache: "no-store" });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <main className="relative mx-auto max-w-2xl px-6 py-12">
      <ThemeToggle className="absolute right-4 top-4" />
      <p className="brand-text text-xs font-semibold uppercase tracking-wider">Agendamento online</p>
      <h1 className="font-display mt-1 text-2xl font-semibold">{negocio.nome}</h1>
      <p className="mt-1 text-sm text-ink-soft">Escolha o serviço, o dia e o horário que preferir.</p>

      <div className="mt-6">
        <FluxoAgendamento negocio={negocio} />
      </div>
    </main>
  );
}
