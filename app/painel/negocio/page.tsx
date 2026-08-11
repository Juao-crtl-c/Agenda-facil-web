"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import { usePainel } from "@/lib/painel-context";
import { DIAS_SEMANA, type HorarioFuncionamento, type Negocio } from "@/lib/types";

type LinhaHorario = { ativo: boolean; horaAbertura: string; horaFechamento: string };

function horariosParaLinhas(horarios: HorarioFuncionamento[] | undefined): LinhaHorario[] {
  return DIAS_SEMANA.map((_, diaSemana) => {
    const existente = horarios?.find((h) => h.diaSemana === diaSemana);
    return existente
      ? { ativo: true, horaAbertura: existente.horaAbertura, horaFechamento: existente.horaFechamento }
      : { ativo: false, horaAbertura: "09:00", horaFechamento: "18:00" };
  });
}

export default function NegocioPage() {
  const { negocio, setNegocio } = usePainel();

  const [nome, setNome] = useState(negocio?.nome ?? "");
  const [slug, setSlug] = useState(negocio?.slug ?? "");
  const [timezone, setTimezone] = useState(negocio?.timezone ?? "America/Sao_Paulo");
  const [erroNegocio, setErroNegocio] = useState<string | null>(null);
  const [salvandoNegocio, setSalvandoNegocio] = useState(false);
  const [sucessoNegocio, setSucessoNegocio] = useState(false);

  const [linhas, setLinhas] = useState<LinhaHorario[]>(horariosParaLinhas(negocio?.horariosFuncionamento));
  const [erroHorario, setErroHorario] = useState<string | null>(null);
  const [salvandoHorario, setSalvandoHorario] = useState(false);
  const [sucessoHorario, setSucessoHorario] = useState(false);

  useEffect(() => {
    setLinhas(horariosParaLinhas(negocio?.horariosFuncionamento));
  }, [negocio?.horariosFuncionamento]);

  async function salvarNegocio(e: React.FormEvent) {
    e.preventDefault();
    setErroNegocio(null);
    setSucessoNegocio(false);
    setSalvandoNegocio(true);
    try {
      const data = negocio
        ? await apiFetch<Negocio>("/negocios/me", { method: "PUT", body: { nome, timezone } })
        : await apiFetch<Negocio>("/negocios/me", { method: "POST", body: { nome, slug, timezone } });
      setNegocio({ ...negocio, ...data });
      setSucessoNegocio(true);
    } catch (err) {
      setErroNegocio(err instanceof ApiError ? err.message : "Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvandoNegocio(false);
    }
  }

  async function salvarHorarios(e: React.FormEvent) {
    e.preventDefault();
    setErroHorario(null);
    setSucessoHorario(false);
    const horarios = linhas
      .map((l, diaSemana) => ({ diaSemana, horaAbertura: l.horaAbertura, horaFechamento: l.horaFechamento, ativo: l.ativo }))
      .filter((l) => l.ativo)
      .map(({ diaSemana, horaAbertura, horaFechamento }) => ({ diaSemana, horaAbertura, horaFechamento }));

    setSalvandoHorario(true);
    try {
      const data = await apiFetch<Negocio>("/negocios/me/horario-funcionamento", {
        method: "PUT",
        body: { horarios },
      });
      setNegocio(data);
      setSucessoHorario(true);
    } catch (err) {
      setErroHorario(err instanceof ApiError ? err.message : "Não foi possível salvar o horário.");
    } finally {
      setSalvandoHorario(false);
    }
  }

  function atualizarLinha(dia: number, patch: Partial<LinhaHorario>) {
    setLinhas((prev) => prev.map((l, i) => (i === dia ? { ...l, ...patch } : l)));
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-xl font-semibold">
        {negocio ? "Dados do negócio" : "Vamos criar o seu negócio"}
      </h1>

      <form onSubmit={salvarNegocio} className="card mt-4 flex flex-col gap-3 p-5">
        <div>
          <label className="mb-1 block text-xs text-ink-soft">Nome do negócio</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Barbearia do João"
            className="field w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-ink-soft">
            Identificador da URL {negocio && <span className="text-ink-soft/70">(não pode ser alterado)</span>}
          </label>
          <input
            required
            disabled={Boolean(negocio)}
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="Ex: barbearia-do-joao"
            className="field w-full disabled:bg-border/40 disabled:text-ink-soft"
          />
          <p className="mt-1 text-xs text-ink-soft">
            Só letras minúsculas, números e hífen. Vai ser sua página: agendafacil.app/{slug || "seu-negocio"}
          </p>
        </div>
        {erroNegocio && <p className="text-sm text-debit">{erroNegocio}</p>}
        {sucessoNegocio && <p className="text-sm text-accent">Salvo com sucesso.</p>}
        <button type="submit" disabled={salvandoNegocio} className="btn-accent self-start">
          {salvandoNegocio ? "Salvando..." : negocio ? "Salvar alterações" : "Criar negócio"}
        </button>
      </form>

      {negocio && (
        <>
          <h2 className="font-display mt-8 text-lg font-semibold">Horário de funcionamento</h2>
          <form onSubmit={salvarHorarios} className="card mt-4 flex flex-col gap-2 p-5">
            {DIAS_SEMANA.map((nomeDia, dia) => (
              <div key={dia} className="flex items-center gap-3 border-b border-border py-2 last:border-0">
                <label className="flex w-28 shrink-0 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={linhas[dia].ativo}
                    onChange={(e) => atualizarLinha(dia, { ativo: e.target.checked })}
                  />
                  {nomeDia}
                </label>
                <input
                  type="time"
                  disabled={!linhas[dia].ativo}
                  value={linhas[dia].horaAbertura}
                  onChange={(e) => atualizarLinha(dia, { horaAbertura: e.target.value })}
                  className="field disabled:opacity-40"
                />
                <span className="text-ink-soft">até</span>
                <input
                  type="time"
                  disabled={!linhas[dia].ativo}
                  value={linhas[dia].horaFechamento}
                  onChange={(e) => atualizarLinha(dia, { horaFechamento: e.target.value })}
                  className="field disabled:opacity-40"
                />
              </div>
            ))}
            {erroHorario && <p className="text-sm text-debit">{erroHorario}</p>}
            {sucessoHorario && <p className="text-sm text-accent">Horário salvo.</p>}
            <button type="submit" disabled={salvandoHorario} className="btn-accent mt-2 self-start">
              {salvandoHorario ? "Salvando..." : "Salvar horário"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
