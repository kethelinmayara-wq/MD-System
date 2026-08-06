import { 
  fetchResumoFinanceiro, 
  adicionarGastoService, 
  adicionarGanhoService,
  editarRegistroService,
  deletarRegistroService 
} from '../services/finance-service';

export const converterArquivoParaBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Formata de YYYY-MM-DD para DD/MM/AAAA
export const formatarDataBR = (dataIso: string) => {
  if (!dataIso) return '';
  if (dataIso.includes('/')) return dataIso;
  const parteData = dataIso.split('T')[0];
  const [ano, mes, dia] = parteData.split('-');
  if (!ano || !mes || !dia) return dataIso;
  return `${dia}/${mes}/${ano}`;
};

// Converte DD/MM/AAAA para YYYY-MM-DD (para popular o input type="date")
export const formatarDataInput = (dataStr: string) => {
  if (!dataStr) return '';
  if (dataStr.includes('-')) return dataStr.split('T')[0];
  const [dia, mes, ano] = dataStr.split('/');
  if (!dia || !mes || !ano) return '';
  return `${ano}-${mes}-${dia}`;
};

export const carregarDadosDashboard = async (
  setResumo: (resumo: any) => void, 
  setLoading: (loading: boolean) => void, 
  setError: (error: string | null) => void
) => {
  setLoading(true);
  setError(null);
  try {
    const resultado = await fetchResumoFinanceiro();
    setResumo(resultado);
  } catch (err) {
    setError('Erro ao carregar dados financeiros.');
  } finally {
    setLoading(false);
  }
};

export const handleAdicionarTransacao = async (
  tipo: 'gasto' | 'ganho', 
  dadosForm: { identificador: string; valor: string; data: string }, 
  arquivo: File | null, 
  onSuccess: () => void, 
  setError: (error: string | null) => void
) => {
  try {
    let notaFiscalBase64 = '';
    let nomeArquivo = '';

    if (arquivo) {
      notaFiscalBase64 = await converterArquivoParaBase64(arquivo);
      nomeArquivo = arquivo.name;
    }

    const payload = {
      data: dadosForm.data,
      identificador: dadosForm.identificador,
      valor: Number(dadosForm.valor),
      ...(tipo === 'gasto' && { notaFiscalBase64, nomeArquivo })
    };

    const resposta = tipo === 'gasto' 
      ? await adicionarGastoService(payload) 
      : await adicionarGanhoService(payload);

    if (resposta.status === 201 || resposta.status === 200) {
      onSuccess();
    } else {
      setError(resposta.mensagem || 'Erro ao salvar registro.');
    }
  } catch (err) {
    setError('Erro de conexão com o servidor.');
  }
};

// ATUALIZADO: Agora aceita o payload consolidado (compatível com os 5 argumentos do componente)
export const handleEditarRegistro = async (
  aba: 'Gastos' | 'Ganhos',
  id: string,
  dadosForm: { 
    data?: string; 
    identificador?: string; 
    valor?: number; 
    notaFiscalBase64?: string; 
    nomeArquivo?: string 
  },
  onSuccess: () => void,
  setError: (error: string | null) => void
) => {
  try {
    const resposta = await editarRegistroService({
      aba,
      id,
      ...dadosForm
    });

    if (resposta.status === 200 || resposta.status === 201) {
      onSuccess();
    } else {
      setError(resposta.mensagem || 'Erro ao atualizar registro.');
    }
  } catch (err) {
    setError('Erro de conexão com o servidor ao editar.');
  }
};

export const handleDeletarRegistro = async (
  aba: 'Gastos' | 'Ganhos',
  id: string,
  onSuccess: () => void,
  setError: (error: string | null) => void
) => {
  if (!window.confirm('Tem certeza que deseja excluir este registro?')) return;

  try {
    const resposta = await deletarRegistroService(aba, id);

    if (resposta.status === 200 || resposta.status === 201) {
      onSuccess();
    } else {
      setError(resposta.mensagem || 'Erro ao deletar registro.');
    }
  } catch (err) {
    setError('Erro de conexão com o servidor ao deletar.');
  }
};