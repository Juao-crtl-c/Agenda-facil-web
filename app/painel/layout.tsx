"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { getToken, getUsuario, type Usuario } from "@/lib/auth";
import { PainelProvider } from "@/lib/painel-context";
import type { Negocio } from "@/lib/types";
import PainelSidebar from "@/components/PainelSidebar";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/entrar");
      return;
    }
    setUsuario(getUsuario());

    apiFetch<Negocio>("/negocios/me")
      .then((data) => {
        setNegocio(data);
        setCarregando(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNegocio(null);
          setCarregando(false);
          if (pathname !== "/painel/negocio") router.replace("/painel/negocio");
          return;
        }
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/entrar");
          return;
        }
        setCarregando(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (carregando) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink-soft">Carregando...</div>;
  }

  return (
    <PainelProvider negocioInicial={negocio}>
      <div className="flex min-h-[calc(100vh-53px)] flex-col md:flex-row">
        <PainelSidebar usuario={usuario} />
        <div className="min-w-0 flex-1 p-4 sm:p-6 md:p-8">{children}</div>
      </div>
    </PainelProvider>
  );
}
