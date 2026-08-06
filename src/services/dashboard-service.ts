const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSHqCFwnaSl9PYo7Cbj3QzcpB_cZHypG8xXTKASEeuF5zAq_GJJd6efmerC8jUviKL/exec';

export interface NotaFiscalItem {
  identificador: string;
  url: string;
  data: string;
}

export interface BalancoMesItem {
  ganhos: number;
  gastos: number;
  saldo: number;
  status: 'Positivo' | 'Negativo';
}

export interface ComparativoItem {
  mes: string;
  comparadoCom: string;
  variacaoPercentual: string;
}

export interface ResumoFinanceiroCompleto {
  somatorioGanhos: number;               // 2.4
  somatorioGastos: number;               // 2.5
  notasFiscais: NotaFiscalItem[];        // 2.6
  mediaGastaPorMes: string;              // 2.7
  margemGeral: 'Positiva' | 'Negativa';  // 2.8
  balancoPorMes: Record<string, BalancoMesItem>; // 2.9
  comparativoMesAMes: ComparativoItem[]; // 2.10
  maioresGastosPorIdentificador: Record<string, number>; // 2.11
}

export const fetchDashboardData = async (): Promise<ResumoFinanceiroCompleto> => {
  const response = await fetch(`${SCRIPT_URL}?acao=financeiro_resumo`, {
    method: 'GET',
  });
  return await response.json();
};