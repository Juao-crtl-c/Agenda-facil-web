"use client";

import { useEffect, useState } from "react";
import { addDays, addWeeks, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiFetch, ApiError } from "@/lib/api";
import type { Agendamento, Bloqueio } from "@/lib/types";

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AgendaPage() {
  const [referencia, setReferencia] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[] | null>(null);
  const [bloqueios, setBloqueios] = useState<Bloqueio[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [inicioBloqueio, setInicioBloqueio] = useState("");
  const [fimBloqueio, setFimBloqueio] = useState("");
  const [motivoBloqueio, setMotivoBloqueio] = useState("");
  const [criandoBloqueio, setCriandoBloqueio] = useState(false);
  const [erroBloqueio, setErroBloqueio] = useState<string | null>(null);

  const inicioSemana = startOfWeek(referencia, { weekStartsOn: 0 });
  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicioSemana, i));

  function carregarAgendamentos() {
    const de = format(inicioSemana, "yyyy-MM-dd");
    // +1 dia no "ate" porque a API compara contra um instante (00:00 UTC do
    // dia informado) — sem a folga, os agendamentos do último dia da semana
    // à tarde ficariam de fora do filtro "lte".
    const ate = format(addDays(inicioSemana, 7), "yyyy-MM-dd");
    apiFetch<Agendamento[]>(`/agendamentos?de=${de}&ate=${ate}`)
      .then(setAgendamentos)
      .catch((err) => setErro(err instanceof ApiError ? err.message : "Não foi possível carregar a agenda."));
  }

  function carregarBloqueios() {
    apiFetch<Bloqueio[]>("/bloqueios")
      .then(setBloqueios)
      .catch(() => {});
  }

  useEffect(() => {
    carregarAgendamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referencia]);

  useEffect(carregarBloqueios, []);

  async function criarBloqueio(e: React.FormEvent) {
    e.preventDefault();
    setErroBloqueio(null);
    setCriandoBloqueio(true);
    try {
      // datetime-local não carrega timezone — assumimos que o navegador do
      // dono está no mesmo fuso do negócio (premissa razoável pra um
      // negócio local só operando numa cidade).
      await apiFetch("/bloqueios", {
        method: "POST",
        body: {
          dataHoraInicio: new Date(inicioBloqueio).toISOString(),
          dataHoraFim: new Date(fimBloqueio).toISOString(),
          motivo: motivoBloqueio || undefined,
        },
      });
      setInicioBloqueio("");
      setFimBloqueio("");
      setMotivoBloqueio("");
      carregarBloqueios();
    } catch (err) {
      setErroBloqueio(err instanceof ApiError ? err.message : "Não foi possível criar o bloqueio.");
    } finally {
      setCriandoBloqueio(false);
    }
  }

  async function removerBloqueio(id: string) {
    if (!confirm("Remover esse bloqueio?")) return;
    await apiFetch(`/bloqueios/${id}`, { method: "DELETE" }).catch(() => {});
    carregarBloqueios();
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-xl font-semibold">Agenda</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button onClick={() => setReferencia((d) => addWeeks(d, -1))} className="btn-outline px-3 py-1">
            ← semana anterior
          </button>
          <button onClick={() => setReferencia(new Date())} className="btn-outline px-3 py-1">
            hoje
          </button>
          <button onClick={() => setReferencia((d) => addWeeks(d, 1))} className="btn-outline px-3 py-1">
            próxima semana →
          </button>
        </div>
      </div>

      {erro && <p className="mt-2 text-sm text-debit">{erro}</p>}

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dias.map((dia) => {
            const chave = format(dia, "yyyy-MM-dd");
            const doDia = (agendamentos ?? []).filter((a) => a.dataHoraInicio.startsWith(chave));
            const temAtivo = doDia.some((a) => a.status !== "CANCELADO");
            return (
              <div key={chave} className="card-glass p-3">
                <div className="flex items-center gap-1.5">
                  {temAtivo && <span className="bg-brand h-1.5 w-1.5 shrink-0 rounded-full" />}
                  <p className="text-xs font-medium capitalize text-ink-soft">
                    {format(dia, "EEE, dd/MM", { locale: ptBR })}
                  </p>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  {doDia.length === 0 && <p className="text-xs text-ink-soft/70">Sem agendamentos</p>}
                  {doDia.map((a) => (
                    <div
                      key={a.id}
                      className={`rounded-sm border border-border bg-surface p-2 text-xs ${
                        a.status === "CANCELADO" ? "opacity-50" : ""
                      }`}
                    >
                      <p className="tabular font-medium">
                        {format(new Date(a.dataHoraInicio), "HH:mm")} · {a.servico?.nome}
                      </p>
                      <p className="text-ink-soft">{a.clienteNome}</p>
                      {a.status === "CANCELADO" && <p className="text-debit">cancelado</p>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <p className="text-sm font-medium">Bloqueios</p>
          <div className="card-glass mt-2 divide-y divide-border">
            {bloqueios?.length === 0 && <p className="p-3 text-xs text-ink-soft">Nenhum bloqueio.</p>}
            {bloqueios?.map((b) => (
              <div key={b.id} className="p-3 text-xs">
                <p className="tabular">
                  {format(new Date(b.dataHoraInicio), "dd/MM HH:mm")} – {format(new Date(b.dataHoraFim), "dd/MM HH:mm")}
                </p>
                {b.motivo && <p className="text-ink-soft">{b.motivo}</p>}
                <button onClick={() => removerBloqueio(b.id)} className="mt-1 text-debit hover:underline">
                  remover
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={criarBloqueio} className="card-glass mt-3 flex flex-col gap-2 p-3">
            <label className="text-xs text-ink-soft">Início</label>
            <input
              required
              type="datetime-local"
              value={inicioBloqueio}
              onChange={(e) => setInicioBloqueio(e.target.value)}
              className="field text-xs"
            />
            <label className="text-xs text-ink-soft">Fim</label>
            <input
              required
              type="datetime-local"
              value={fimBloqueio}
              onChange={(e) => setFimBloqueio(e.target.value)}
              className="field text-xs"
            />
            <input
              placeholder="Motivo (opcional)"
              value={motivoBloqueio}
              onChange={(e) => setMotivoBloqueio(e.target.value)}
              className="field text-xs"
            />
            {erroBloqueio && <p className="text-xs text-debit">{erroBloqueio}</p>}
            <button type="submit" disabled={criandoBloqueio} className="btn-accent text-xs">
              {criandoBloqueio ? "Criando..." : "Bloquear horário"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
