import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import type { Agendamento } from "@/lib/types";
import DetalhesAgendamento from "@/components/DetalhesAgendamento";
import ThemeToggle from "@/components/ThemeToggle";

export default async function AgendamentoPage({ params }: { params: { token: string } }) {
  let agendamento: Agendamento;
  try {
    agendamento = await apiFetch<Agendamento>(`/agendamentos/${params.token}`, {
      auth: false,
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <main className="relative mx-auto max-w-lg px-6 py-12">
      <ThemeToggle className="absolute right-4 top-4" />
      <DetalhesAgendamento agendamentoInicial={agendamento} token={params.token} />
    </main>
  );
}
