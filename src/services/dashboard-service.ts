const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw5O0x0vEf2iGenVt7R4DdiG2vDX8XdOzXswTaq8iuoYoRxLz2cTyInnF5rLhrh7y5KUg/exec';

// Função auxiliar para recuperar o ID do usuário logado no localStorage
const obterUsuarioIdLogado = (): string => {
  const usuarioStr = localStorage.getItem('usuario_logado');
  if (!usuarioStr) return '';
  try {
    const usuario = JSON.parse(usuarioStr);
    return usuario.id || '';
  } catch {
    return '';
  }
};

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
  const usuarioId = obterUsuarioIdLogado();
  const response = await fetch(`${SCRIPT_URL}?acao=financeiro_resumo&usuarioId=${usuarioId}`, {
    method: 'GET',
    redirect: 'follow',
  });
  
  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  return await response.json();
};