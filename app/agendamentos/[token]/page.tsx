import { notFound } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import type { Agendamento } from "@/lib/types";
import DetalhesAgendamento from "@/components/DetalhesAgendamento";

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
    <main className="mx-auto max-w-lg px-6 py-12">
      <DetalhesAgendamento agendamentoInicial={agendamento} token={params.token} />
    </main>
  );
}
