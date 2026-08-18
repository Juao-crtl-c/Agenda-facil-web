"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { salvarSessao } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const data = await apiFetch<{ token: string; usuario: { id: string; nome: string; email: string } }>(
        "/auth/registro",
        { method: "POST", body: { nome, email, senha }, auth: false }
      );
      salvarSessao(data.token, data.usuario);
      router.push("/painel");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível criar sua conta. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-20">
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="card-glass p-6">
        <h1 className="font-display text-xl font-semibold">Criar conta</h1>
        <p className="mt-1 text-sm text-ink-soft">Configure a agenda do seu negócio em poucos minutos.</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <input
            required
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="field"
          />
          <input
            type="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Senha (mínimo 8 caracteres)"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="field"
          />
          {erro && <p className="text-sm text-rose-600 dark:text-rose-400">{erro}</p>}
          <button type="submit" disabled={enviando} className="btn-accent">
            {enviando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Já tem conta?{" "}
          <Link href="/entrar" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
