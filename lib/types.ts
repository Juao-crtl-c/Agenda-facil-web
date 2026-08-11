export type HorarioFuncionamento = {
  id?: string;
  diaSemana: number; // 0 = domingo ... 6 = sábado
  horaAbertura: string; // "HH:mm"
  horaFechamento: string;
};

export type Servico = {
  id: string;
  nome: string;
  duracaoMinutos: number;
  preco: string | number;
};

export type Negocio = {
  id: string;
  nome: string;
  slug: string;
  timezone: string;
  criadoEm?: string;
  servicos?: Servico[];
  horariosFuncionamento?: HorarioFuncionamento[];
};

export type Slot = { inicio: string; fim: string };

export type StatusAgendamento = "CONFIRMADO" | "CANCELADO" | "CONCLUIDO";

export type Agendamento = {
  id: string;
  negocioId: string;
  servicoId: string;
  servico?: Servico;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: StatusAgendamento;
  tokenCancelamento: string;
  criadoEm?: string;
  negocio?: { nome: string; slug: string; timezone: string };
};

export type Bloqueio = {
  id: string;
  negocioId: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  motivo?: string | null;
};

export const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
