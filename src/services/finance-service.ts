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
  const usuarioId = obterUsuarioIdLogado();
  const response = await fetch(`${SCRIPT_URL}?acao=${acao}&usuarioId=${usuarioId}`, {
    method: 'GET',
    redirect: 'follow',
  });
  
  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }
  
  return await response.json();
};

const postRequest = async (payload: object) => {
  const usuarioId = obterUsuarioIdLogado();
  // Injeta o usuarioId automaticamente no payload enviado via POST
  const payloadComUsuario = { ...payload, usuarioId };

  const response = await fetch(SCRIPT_URL, {
    method: 'POST', 
    redirect: 'follow',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payloadComUsuario),
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