"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { Negocio } from "./types";

type PainelContextValue = {
  negocio: Negocio | null;
  setNegocio: (n: Negocio | null) => void;
};

const PainelContext = createContext<PainelContextValue | null>(null);

export function PainelProvider({
  negocioInicial,
  children,
}: {
  negocioInicial: Negocio | null;
  children: React.ReactNode;
}) {
  const [negocio, setNegocioState] = useState<Negocio | null>(negocioInicial);
  const setNegocio = useCallback((n: Negocio | null) => setNegocioState(n), []);

  return <PainelContext.Provider value={{ negocio, setNegocio }}>{children}</PainelContext.Provider>;
}

// Só é usado dentro de app/painel/**, onde o layout garante que o Provider
// já envolveu a árvore (por isso o throw — indica um erro de composição, não
// um estado esperado de "ainda carregando").
export function usePainel() {
  const ctx = useContext(PainelContext);
  if (!ctx) throw new Error("usePainel precisa estar dentro de app/painel (PainelProvider).");
  return ctx;
}
