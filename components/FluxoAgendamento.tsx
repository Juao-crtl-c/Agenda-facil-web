"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Agendamento, Negocio, Servico, Slot } from "@/lib/types";

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function hojeISO() {
  const d = new Date();
  return format(d, "yyyy-MM-dd");
}

type Etapa = "servico" | "horario" | "cliente" | "sucesso";

export default function FluxoAgendamento({ negocio }: { negocio: Negocio }) {
  const [etapa, setEtapa] = useState<Etapa>("servico");
  const [servico, setServico] = useState<Servico | null>(null);
  const [data, setData] = useState(hojeISO());
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [erroSlots, setErroSlots] = useState<string | null>(null);
  const [slotEscolhido, setSlotEscolhido] = useState<Slot | null>(null);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Agendamento | null>(null);

  const diaSemanaEscolhido = new Date(`${data}T00:00:00`).getDay();
  const atendeNesseDia = negocio.horariosFuncionamento?.some((h) => h.diaSemana === diaSemanaEscolhido);

  useEffect(() => {
    if (etapa !== "horario" || !servico) return;
    if (!atendeNesseDia) {
      setSlots([]);
      return;
    }
    setSlots(null);
    setErroSlots(null);
    apiFetch<Slot[]>(`/negocios/${negocio.slug}/disponibilidade?servicoId=${servico.id}&data=${data}`, {
      auth: false,
    })
      .then(setSlots)
      .catch((err) => setErroSlots(err instanceof ApiError ? err.message : "Não foi possível carregar os horários."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapa, servico, data]);

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    if (!servico || !slotEscolhido) return;
    setErroEnvio(null);
    setEnviando(true);
    try {
      const agendamento = await apiFetch<Agendamento>(`/negocios/${negocio.slug}/agendamentos`, {
        method: "POST",
        auth: false,
        body: {
          servicoId: servico.id,
          clienteNome: nome,
          clienteTelefone: telefone,
          clienteEmail: email,
          dataHoraInicio: slotEscolhido.inicio,
        },
      });
      setResultado(agendamento);
      setEtapa("sucesso");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErroEnvio("Esse horário acabou de ser reservado por outra pessoa. Escolha outro.");
        setSlotEscolhido(null);
        setEtapa("horario");
        // refaz a consulta pra já tirar o horário que sumiu
        apiFetch<Slot[]>(`/negocios/${negocio.slug}/disponibilidade?servicoId=${servico.id}&data=${data}`, {
          auth: false,
        })
          .then(setSlots)
          .catch(() => {});
      } else {
        setErroEnvio(err instanceof ApiError ? err.message : "Não foi possível confirmar. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  if (etapa === "sucesso" && resultado) {
    return (
      <div className="card p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-accent" />
        <p className="mt-3 font-medium">Agendamento confirmado!</p>
        <p className="mt-1 text-sm text-ink-soft">
          {format(new Date(resultado.dataHoraInicio), "dd/MM/yyyy 'às' HH:mm")} — {servico?.nome}
        </p>
        <p className="mt-4 text-xs text-ink-soft">Guarde o link abaixo pra cancelar ou remarcar se precisar:</p>
        <a
          href={`/agendamentos/${resultado.tokenCancelamento}`}
          className="mt-1 block break-all text-xs text-accent hover:underline"
        >
          {typeof window !== "undefined" ? window.location.origin : ""}/agendamentos/{resultado.tokenCancelamento}
        </a>
      </div>
    );
  }

  return (
    <div className="card p-5">
      {etapa === "servico" && (
        <div>
          <p className="mb-3 text-sm font-medium">1. Escolha o serviço</p>
          <div className="flex flex-col gap-2">
            {(negocio.servicos ?? []).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setServico(s);
                  setEtapa("horario");
                }}
                className="flex items-center justify-between rounded-sm border border-border px-4 py-3 text-left text-sm hover:border-accent"
              >
                <span>
                  <span className="font-medium">{s.nome}</span>
                  <span className="ml-2 text-ink-soft">{s.duracaoMinutos} min</span>
                </span>
                <span className="tabular text-ink-soft">{formatBRL(s.preco)}</span>
              </button>
            ))}
            {(negocio.servicos?.length ?? 0) === 0 && (
              <p className="text-sm text-ink-soft">Esse negócio ainda não cadastrou serviços.</p>
            )}
          </div>
        </div>
      )}

      {etapa === "horario" && servico && (
        <div>
          <button onClick={() => setEtapa("servico")} className="mb-3 text-xs text-ink-soft hover:underline">
            ← trocar serviço
          </button>
          <p className="mb-3 text-sm font-medium">2. Escolha o dia e o horário — {servico.nome}</p>
          <input
            type="date"
            min={hojeISO()}
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="field"
          />

          <div className="mt-4">
            {!atendeNesseDia && <p className="text-sm text-ink-soft">Fechado nesse dia. Escolha outra data.</p>}
            {atendeNesseDia && slots === null && !erroSlots && (
              <p className="text-sm text-ink-soft">Carregando horários...</p>
            )}
            {erroSlots && <p className="text-sm text-debit">{erroSlots}</p>}
            {atendeNesseDia && slots?.length === 0 && (
              <p className="text-sm text-ink-soft">Nenhum horário livre nesse dia.</p>
            )}
            {slots && slots.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot.inicio}
                    onClick={() => {
                      setSlotEscolhido(slot);
                      setEtapa("cliente");
                    }}
                    className="tabular rounded-sm border border-border py-2 text-sm hover:border-accent hover:bg-accent-soft"
                  >
                    {format(new Date(slot.inicio), "HH:mm")}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {etapa === "cliente" && servico && slotEscolhido && (
        <div>
          <button onClick={() => setEtapa("horario")} className="mb-3 text-xs text-ink-soft hover:underline">
            ← trocar horário
          </button>
          <p className="mb-3 text-sm font-medium">
            3. Confirme — {servico.nome}, {format(new Date(slotEscolhido.inicio), "dd/MM 'às' HH:mm")}
          </p>
          <form onSubmit={confirmar} className="flex flex-col gap-3">
            <input required placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} className="field" />
            <input
              required
              placeholder="Telefone (com DDD)"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="field"
            />
            <input
              required
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
            />
            {erroEnvio && <p className="text-sm text-debit">{erroEnvio}</p>}
            <button type="submit" disabled={enviando} className="btn-accent">
              {enviando ? "Confirmando..." : "Confirmar agendamento"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
