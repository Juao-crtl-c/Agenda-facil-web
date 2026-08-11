"use client";

import { useCallback, useEffect, useState } from "react";

export type Usuario = { id: string; nome: string; email: string };

const TOKEN_KEY = "agenda-facil:token";
const USUARIO_KEY = "agenda-facil:usuario";

// localStorage só existe no browser — todo acesso aqui precisa ser
// client-side (por isso este módulo é "use client" e as páginas de Server
// Component nunca chamam essas funções diretamente).
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUsuario(): Usuario | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USUARIO_KEY);
  return raw ? (JSON.parse(raw) as Usuario) : null;
}

export function salvarSessao(token: string, usuario: Usuario) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
}

export function limparSessao() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USUARIO_KEY);
}

// Hook pra componentes client saberem o estado de auth depois da hidratação
// (no primeiro render do server não existe localStorage, então tudo começa
// como "carregando" pra evitar flash de conteúdo errado).
export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setUsuario(getUsuario());
    setCarregando(false);
  }, []);

  const logout = useCallback(() => {
    limparSessao();
    setUsuario(null);
  }, []);

  return { usuario, carregando, logout, autenticado: Boolean(getToken()) };
}
