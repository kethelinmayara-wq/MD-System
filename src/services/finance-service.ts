const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSHqCFwnaSl9PYo7Cbj3QzcpB_cZHypG8xXTKASEeuF5zAq_GJJd6efmerC8jUviKL/exec';

export interface TransacaoPayload {
  data?: string;
  identificador: string;
  valor: number;
  notaFiscalBase64?: string;
  nomeArquivo?: string;
}

export interface EdicaoPayload {
  aba: 'Gastos' | 'Ganhos';
  id: string;
  data?: string;
  identificador?: string;
  valor?: number;
  notaFiscalBase64?: string;
  nomeArquivo?: string;
}

const getRequest = async (acao: string) => {
  const response = await fetch(`${SCRIPT_URL}?acao=${acao}`, {
    method: 'GET',
  });
  
  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }
  
  return await response.json();
};

const postRequest = async (payload: object) => {
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  return await response.json();
};

export const fetchResumoFinanceiro = async () => {
  try {
    return await getRequest('financeiro_resumo');
  } catch (error) {
    // Retorna uma estrutura padrão vazia se a planilha estiver em branco ou ocorrer 404/erro de rede
    console.warn('Aviso: Nenhum dado financeiro encontrado ou planilha vazia. Inicializando com estrutura padrão.', error);
    return {
      somatorioGanhos: 0,
      somatorioGastos: 0,
      transacoes: [],
      notasFiscais: []
    };
  }
};

export const adicionarGastoService = async (dados: TransacaoPayload) => {
  return await postRequest({ acao: 'adicionar_gasto', ...dados });
};

export const adicionarGanhoService = async (dados: TransacaoPayload) => {
  return await postRequest({ acao: 'adicionar_ganho', ...dados });
};

export const editarRegistroService = async (dados: EdicaoPayload) => {
  return await postRequest({ acao: 'editar_registro', ...dados });
};

export const deletarRegistroService = async (aba: 'Gastos' | 'Ganhos', id: string) => {
  return await postRequest({ acao: 'deletar_registro', aba, id });
};