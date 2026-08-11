"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { apiFetch, ApiError } from "@/lib/api";
import type { Agendamento, Slot } from "@/lib/types";

function hojeISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export default function DetalhesAgendamento({
  agendamentoInicial,
  token,
}: {
  agendamentoInicial: Agendamento;
  token: string;
}) {
  const [agendamento, setAgendamento] = useState(agendamentoInicial);
  const [erro, setErro] = useState<string | null>(null);

  const [remarcando, setRemarcando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [data, setData] = useState(hojeISO());
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [erroSlots, setErroSlots] = useState<string | null>(null);
  const [confirmandoSlot, setConfirmandoSlot] = useState(false);

  const negocioSlug = agendamento.negocio?.slug;

  useEffect(() => {
    if (!remarcando || !negocioSlug) return;
    setSlots(null);
    setErroSlots(null);
    apiFetch<Slot[]>(`/negocios/${negocioSlug}/disponibilidade?servicoId=${agendamento.servicoId}&data=${data}`, {
      auth: false,
    })
      .then(setSlots)
      .catch((err) => setErroSlots(err instanceof ApiError ? err.message : "Não foi possível carregar os horários."));
  }, [remarcando, data, negocioSlug, agendamento.servicoId]);

  async function cancelar() {
    if (!confirm("Cancelar esse agendamento?")) return;
    setErro(null);
    setCancelando(true);
    try {
      const atualizado = await apiFetch<Agendamento>(`/agendamentos/${token}/cancelar`, {
        method: "POST",
        auth: false,
      });
      setAgendamento((prev) => ({ ...prev, ...atualizado }));
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível cancelar. Tente novamente.");
    } finally {
      setCancelando(false);
    }
  }

  async function remarcarPara(slot: Slot) {
    setErro(null);
    setConfirmandoSlot(true);
    try {
      const atualizado = await apiFetch<Agendamento>(`/agendamentos/${token}`, {
        method: "PATCH",
        auth: false,
        body: { dataHoraInicio: slot.inicio },
      });
      setAgendamento((prev) => ({ ...prev, ...atualizado }));
      setRemarcando(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErroSlots("Esse horário acabou de ser reservado por outra pessoa. Escolha outro.");
      } else {
        setErro(err instanceof ApiError ? err.message : "Não foi possível remarcar. Tente novamente.");
      }
    } finally {
      setConfirmandoSlot(false);
    }
  }

  const confirmado = agendamento.status === "CONFIRMADO";

  return (
    <div className="card p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-accent">{agendamento.negocio?.nome}</p>
      <h1 className="font-display mt-1 text-xl font-semibold">{agendamento.servico?.nome}</h1>
      <p className="tabular mt-1 text-sm text-ink-soft">
        {format(new Date(agendamento.dataHoraInicio), "dd/MM/yyyy 'às' HH:mm")}
      </p>
      <p className="mt-2 text-xs">
        Status:{" "}
        <span
          className={
            agendamento.status === "CONFIRMADO"
              ? "text-accent"
              : agendamento.status === "CANCELADO"
              ? "text-debit"
              : "text-ink-soft"
          }
        >
          {agendamento.status.toLowerCase()}
        </span>
      </p>

      {erro && <p className="mt-3 text-sm text-debit">{erro}</p>}

      {confirmado && !remarcando && (
        <div className="mt-5 flex gap-2">
          <button onClick={() => setRemarcando(true)} className="btn-outline text-sm">
            Remarcar
          </button>
          <button onClick={cancelar} disabled={cancelando} className="btn-outline text-sm text-debit">
            {cancelando ? "Cancelando..." : "Cancelar"}
          </button>
        </div>
      )}

      {confirmado && remarcando && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-sm font-medium">Escolha o novo dia e horário</p>
          <input
            type="date"
            min={hojeISO()}
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="field"
          />
          <div className="mt-3">
            {slots === null && !erroSlots && <p className="text-sm text-ink-soft">Carregando horários...</p>}
            {erroSlots && <p className="text-sm text-debit">{erroSlots}</p>}
            {slots?.length === 0 && <p className="text-sm text-ink-soft">Nenhum horário livre nesse dia.</p>}
            {slots && slots.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.inicio}
                    disabled={confirmandoSlot}
                    onClick={() => remarcarPara(slot)}
                    className="tabular rounded-sm border border-border py-2 text-sm hover:border-accent hover:bg-accent-soft disabled:opacity-50"
                  >
                    {format(new Date(slot.inicio), "HH:mm")}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setRemarcando(false)} className="mt-3 text-xs text-ink-soft hover:underline">
            cancelar remarcação
          </button>
        </div>
      )}
    </div>
  );
}
