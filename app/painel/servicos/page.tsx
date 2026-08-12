"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Servico } from "@/lib/types";

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [duracao, setDuracao] = useState("30");
  const [preco, setPreco] = useState("");
  const [criando, setCriando] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [edicao, setEdicao] = useState({ nome: "", duracaoMinutos: "", preco: "" });

  function carregar() {
    apiFetch<Servico[]>("/servicos")
      .then(setServicos)
      .catch((err) => setErro(err instanceof ApiError ? err.message : "Não foi possível carregar os serviços."));
  }

  useEffect(carregar, []);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCriando(true);
    try {
      await apiFetch("/servicos", {
        method: "POST",
        body: { nome, duracaoMinutos: Number(duracao), preco: Number(preco) },
      });
      setNome("");
      setDuracao("30");
      setPreco("");
      carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível criar o serviço.");
    } finally {
      setCriando(false);
    }
  }

  function iniciarEdicao(s: Servico) {
    setEditandoId(s.id);
    setEdicao({ nome: s.nome, duracaoMinutos: String(s.duracaoMinutos), preco: String(s.preco) });
  }

  async function salvarEdicao(id: string) {
    setErro(null);
    try {
      await apiFetch(`/servicos/${id}`, {
        method: "PUT",
        body: {
          nome: edicao.nome,
          duracaoMinutos: Number(edicao.duracaoMinutos),
          preco: Number(edicao.preco),
        },
      });
      setEditandoId(null);
      carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    }
  }

  async function remover(id: string, nomeServico: string) {
    if (!confirm(`Remover o serviço "${nomeServico}"?`)) return;
    setErro(null);
    try {
      await apiFetch(`/servicos/${id}`, { method: "DELETE" });
      carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível remover.");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-xl font-semibold">Serviços</h1>
      <p className="mt-1 text-sm text-ink-soft">Os serviços que aparecem pro cliente na hora de agendar.</p>

      <div className="card-glass mt-4 divide-y divide-border">
        {servicos === null && <p className="p-4 text-sm text-ink-soft">Carregando...</p>}
        {servicos?.length === 0 && <p className="p-4 text-sm text-ink-soft">Nenhum serviço cadastrado ainda.</p>}
        {servicos?.map((s) =>
          editandoId === s.id ? (
            <div key={s.id} className="flex flex-wrap items-center gap-2 p-3">
              <input
                value={edicao.nome}
                onChange={(e) => setEdicao((v) => ({ ...v, nome: e.target.value }))}
                className="field flex-1 min-w-[120px]"
              />
              <input
                type="number"
                min={5}
                value={edicao.duracaoMinutos}
                onChange={(e) => setEdicao((v) => ({ ...v, duracaoMinutos: e.target.value }))}
                className="field w-20"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={edicao.preco}
                onChange={(e) => setEdicao((v) => ({ ...v, preco: e.target.value }))}
                className="field w-24"
              />
              <button onClick={() => salvarEdicao(s.id)} className="btn-accent text-xs">
                Salvar
              </button>
              <button onClick={() => setEditandoId(null)} className="btn-outline text-xs">
                Cancelar
              </button>
            </div>
          ) : (
            <div key={s.id} className="flex flex-col gap-2 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-medium">{s.nome}</span>
                <span className="ml-2 text-ink-soft">{s.duracaoMinutos} min</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular text-ink-soft">{formatBRL(s.preco)}</span>
                <button onClick={() => iniciarEdicao(s)} className="text-xs text-accent hover:underline">
                  editar
                </button>
                <button onClick={() => remover(s.id, s.nome)} className="text-xs text-debit hover:underline">
                  remover
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <form onSubmit={criar} className="card-glass mt-4 flex flex-wrap gap-2 p-4">
        <input
          required
          placeholder="Nome (ex: Corte)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="field min-w-[140px] flex-1"
        />
        <input
          required
          type="number"
          min={5}
          max={600}
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
          placeholder="Minutos"
          className="field w-24"
        />
        <input
          required
          type="number"
          min={0}
          step="0.01"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          placeholder="Preço"
          className="field w-28"
        />
        <button type="submit" disabled={criando} className="btn-accent">
          {criando ? "Adicionando..." : "Adicionar"}
        </button>
      </form>
      {erro && <p className="mt-2 text-sm text-debit">{erro}</p>}
    </div>
  );
}
