"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { salvarSessao } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";

export default function EntrarPage() {
  const router = useRouter();
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
        "/auth/login",
        { method: "POST", body: { email, senha }, auth: false }
      );
      salvarSessao(data.token, data.usuario);
      router.push("/painel");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-20">
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="card-glass p-6">
        <h1 className="font-display text-xl font-semibold">Entrar</h1>
        <p className="mt-1 text-sm text-ink-soft">Acesse o painel do seu negócio.</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
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
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="field"
          />
          {erro && <p className="text-sm text-debit">{erro}</p>}
          <button type="submit" disabled={enviando} className="btn-accent">
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="text-accent hover:underline">
            Criar agora
          </Link>
        </p>
      </div>
    </main>
  );
}
