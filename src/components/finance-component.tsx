import React, { useState, useEffect } from 'react';
import { 
  carregarDadosDashboard, 
  handleAdicionarTransacao, 
  handleEditarRegistro, 
  handleDeletarRegistro 
} from '../controllers/finance-controller';

// Função auxiliar para exibir no formato dd/mm/aaaa
const formatarDataBR = (dataIsoOrStr: string) => {
  if (!dataIsoOrStr) return '';
  if (dataIsoOrStr.includes('/')) return dataIsoOrStr;
  
  const parteData = dataIsoOrStr.split('T')[0];
  const [ano, mes, dia] = parteData.split('-');
  if (!ano || !mes || !dia) return dataIsoOrStr;
  return `${dia}/${mes}/${ano}`;
};

export default function FinanceComponent() {
  const [resumo, setResumo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do formulário de Novo Lançamento
  const [tipo, setTipo] = useState<'Gastos' | 'Ganhos'>('Gastos');
  const [identificador, setIdentificador] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  // Estados de Edição
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editAba, setEditAba] = useState<'Gastos' | 'Ganhos'>('Gastos');
  const [editIdentificador, setEditIdentificador] = useState<string>('');
  const [editValor, setEditValor] = useState<string>('');
  const [editData, setEditData] = useState<string>('');
  const [editArquivo, setEditArquivo] = useState<File | null>(null);

  // Filtros de Listagem
  const [filtroBusca, setFiltroBusca] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  const atualizarDashboard = () => {
    carregarDadosDashboard(setResumo, setLoading, setError);
  };

  useEffect(() => {
    atualizarDashboard();
  }, []);

  const onSubmitTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    await handleAdicionarTransacao(
      tipo === 'Gastos' ? 'gasto' : 'ganho', 
      { identificador, valor, data }, 
      arquivo, 
      () => {
        setIdentificador('');
        setValor('');
        setArquivo(null);
        atualizarDashboard();
        alert('Lançamento efetuado com sucesso!');
      }, 
      setError
    );
    setEnviando(false);
  };

  const iniciarEdicao = (item: any) => {
    const idParaEdicao = item.ID ?? item.id;
    const abaDetectada = item.aba || (Number(item.Valor) >= 0 && item.NotaFiscalUrl ? 'Gastos' : 'Ganhos');
    
    setEditandoId(String(idParaEdicao));
    setEditAba(abaDetectada);
    setEditIdentificador(item.Identificador || item.identificador || '');
    setEditValor(item.Valor !== undefined ? String(item.Valor) : String(item.valor || ''));
    setEditData(item.Data ? item.Data.split('T')[0] : (item.data ? item.data.split('T')[0] : ''));
    setEditArquivo(null);
  };

  const salvarEdicao = async () => {
    if (!editandoId) return;
    setError(null);

    let notaFiscalBase64 = undefined;
    let nomeArquivo = undefined;

    if (editArquivo && editAba === 'Gastos') {
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(editArquivo);
      });
      notaFiscalBase64 = fileData;
      nomeArquivo = editArquivo.name;
    }

    const payload = {
      identificador: editIdentificador,
      valor: parseFloat(editValor) || 0,
      data: editData,
      notaFiscalBase64,
      nomeArquivo
    };

    await handleEditarRegistro(
      editAba,
      editandoId,
      payload,
      () => {
        setEditandoId(null);
        setEditArquivo(null);
        atualizarDashboard();
        alert('Registro atualizado com sucesso!');
      },
      setError
    );
  };

  const deletarItem = async (aba: 'Gastos' | 'Ganhos', id: any) => {
    const idFormatado = String(id);
    
    if (!window.confirm(`Deseja realmente excluir este lançamento financeiro?`)) return;

    await handleDeletarRegistro(
      aba,
      idFormatado,
      () => {
        atualizarDashboard();
        alert('Lançamento removido com sucesso!');
      },
      setError
    );
  };

  const transacoesList = resumo?.transacoes || [];
  const totalGanhos = Number(resumo?.somatorioGanhos || 0);
  const totalGastos = Number(resumo?.somatorioGastos || 0);
  const saldoAtual = totalGanhos - totalGastos;

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 sm:p-6 font-sans relative overflow-x-hidden selection:bg-rose-950 selection:text-rose-200">
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-950/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-zinc-900/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-zinc-900 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Controle Financeiro</h1>
            <p className="text-xs text-rose-500 uppercase tracking-widest">Gestão de Ganhos & Gastos</p>
          </div>
          <button 
            onClick={atualizarDashboard}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors shadow-sm"
            title="Atualizar Dados"
          >
            🔄
          </button>
        </header>

        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-900/50 text-rose-300 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        {/* CARDS DE RESUMO (KPIs) */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-zinc-950/90 border border-zinc-900 p-3.5 rounded-2xl shadow-lg">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold block">Ganhos</span>
            <p className="text-sm sm:text-base font-bold text-emerald-400 mt-1 truncate">
              R$ {totalGanhos.toFixed(2)}
            </p>
          </div>

          <div className="bg-zinc-950/90 border border-zinc-900 p-3.5 rounded-2xl shadow-lg">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold block">Gastos</span>
            <p className="text-sm sm:text-base font-bold text-rose-500 mt-1 truncate">
              R$ {totalGastos.toFixed(2)}
            </p>
          </div>

          <div className="bg-zinc-950/90 border border-zinc-900 p-3.5 rounded-2xl shadow-lg">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold block">Saldo Líquido</span>
            <p className={`text-sm sm:text-base font-bold mt-1 truncate ${saldoReportColor(saldoAtual)}`}>
              R$ {saldoAtual.toFixed(2)}
            </p>
          </div>
        </div>

        {/* NOVO LANÇAMENTO */}
        <div className="bg-zinc-950/90 border border-zinc-900 p-5 rounded-2xl shadow-xl">
          <h2 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Novo Lançamento
          </h2>
          
          <div className="flex bg-zinc-900 p-1 rounded-xl mb-4 border border-zinc-800/60">
            <button
              type="button"
              onClick={() => setTipo('Gastos')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tipo === 'Gastos' ? 'bg-rose-950 text-rose-300 border border-rose-900/50 shadow-sm' : 'text-zinc-400'}`}
            >
              💸 Gasto
            </button>
            <button
              type="button"
              onClick={() => setTipo('Ganhos')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tipo === 'Ganhos' ? 'bg-emerald-950 text-emerald-300 border border-emerald-900/50 shadow-sm' : 'text-zinc-400'}`}
            >
              💰 Ganho
            </button>
          </div>

          <form onSubmit={onSubmitTransacao} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase text-zinc-500 font-semibold mb-1">Identificador / Descrição</label>
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="Ex: Supermercado, Salário, Conta de Luz..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-rose-600 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase text-zinc-500 font-semibold mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-rose-600 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-zinc-500 font-semibold mb-1">Data</label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-rose-600 transition-colors"
                  required
                />
              </div>
            </div>

            {tipo === 'Gastos' && (
              <div>
                <label className="block text-[10px] uppercase text-zinc-500 font-semibold mb-1">Comprovante / Nota Fiscal (Opcional)</label>
                <input
                  type="file"
                  accept=".png, .jpg, .jpeg, .pdf"
                  onChange={(e) => setArquivo(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-rose-400 hover:file:bg-zinc-800 cursor-pointer"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 hover:from-rose-900 hover:to-rose-800 text-white font-medium py-3 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(225,29,72,0.15)] transition-all mt-2 disabled:opacity-50"
            >
              {enviando ? 'Processando...' : `Adicionar ${tipo === 'Gastos' ? 'Gasto' : 'Ganho'}`}
            </button>
          </form>
        </div>

        {/* LISTAGEM DE LANÇAMENTOS COM FILTROS */}
        <div className="bg-zinc-950/90 border border-zinc-900 p-4 rounded-2xl space-y-3 shadow-xl">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Histórico de Lançamentos</h3>
            <span className="text-[10px] text-zinc-600 font-mono">{transacoesList.length} registros</span>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-zinc-500 animate-pulse text-xs">
              Sincronizando transações...
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Pesquisar por identificador..."
                  value={filtroBusca}
                  onChange={(e) => setFiltroBusca(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-700"
                />
                <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-[10px] justify-between sm:justify-start">
                  <button
                    type="button"
                    onClick={() => setFiltroTipo('todos')}
                    className={`px-3 py-1 rounded-lg transition-colors ${filtroTipo === 'todos' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroTipo('Gastos')}
                    className={`px-3 py-1 rounded-lg transition-colors ${filtroTipo === 'Gastos' ? 'bg-rose-950/80 text-rose-300 font-semibold' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    Gastos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroTipo('Ganhos')}
                    className={`px-3 py-1 rounded-lg transition-colors ${filtroTipo === 'Ganhos' ? 'bg-emerald-950/80 text-emerald-300 font-semibold' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    Ganhos
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {transacoesList
                  .filter((item: any) => {
                    const itemAba = item.aba || (item.NotaFiscalUrl ? 'Gastos' : 'Ganhos');
                    const matchTipo = filtroTipo === 'todos' || itemAba === filtroTipo;
                    const nomeId = item.Identificador || item.identificador || '';
                    const matchTexto = !filtroBusca || nomeId.toLowerCase().includes(filtroBusca.toLowerCase());
                    return matchTipo && matchTexto;
                  })
                  .map((item: any) => {
                    const itemId = item.ID ?? item.id;
                    const itemAba = item.aba || (item.NotaFiscalUrl ? 'Gastos' : 'Ganhos');
                    const itemNome = item.Identificador || item.identificador || '';
                    const itemValor = Number(item.Valor ?? item.valor ?? 0);
                    const itemData = item.Data || item.data || '';
                    const notaUrl = item.NotaFiscalUrl || item.notaFiscalUrl;

                    return (
                      <div key={itemId} className="bg-zinc-900/50 border border-zinc-800/80 p-3 rounded-xl text-xs space-y-2 transition-all hover:border-zinc-700">
                        {editandoId === String(itemId) ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-rose-400 font-bold uppercase">
                              <span>Editando Lançamento ({editAba})</span>
                            </div>
                            <input
                              type="text"
                              value={editIdentificador}
                              onChange={(e) => setEditIdentificador(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-600"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="number"
                                step="0.01"
                                value={editValor}
                                onChange={(e) => setEditValor(e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-600"
                              />
                              <input
                                type="date"
                                value={editData}
                                onChange={(e) => setEditData(e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-rose-600"
                              />
                            </div>

                            {editAba === 'Gastos' && (
                              <div>
                                <label className="block text-[9px] uppercase text-zinc-500 font-semibold mb-1">Substituir Comprovante (Opcional)</label>
                                <input
                                  type="file"
                                  accept=".png, .jpg, .jpeg, .pdf"
                                  onChange={(e) => setEditArquivo(e.target.files ? e.target.files[0] : null)}
                                  className="w-full text-xs text-zinc-400 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:bg-zinc-900 file:text-rose-400"
                                />
                              </div>
                            )}

                            <div className="flex space-x-2 pt-1">
                              <button 
                                type="button"
                                onClick={salvarEdicao}
                                className="flex-1 bg-emerald-950/80 border border-emerald-900/60 text-emerald-300 py-1.5 rounded-lg font-semibold hover:bg-emerald-900 transition-colors"
                              >
                                Salvar Alterações
                              </button>
                              <button 
                                type="button"
                                onClick={() => setEditandoId(null)}
                                className="flex-1 bg-zinc-800 text-zinc-300 py-1.5 rounded-lg font-semibold hover:bg-zinc-700 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div className="space-y-0.5">
                              <p className="text-white font-medium flex items-center gap-2">
                                {itemNome}
                              </p>
                              <p className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                                <span>{formatarDataBR(itemData)}</span>
                                <span>•</span>
                                <span className={`font-semibold ${itemAba === 'Ganhos' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  R$ {itemValor.toFixed(2)}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase tracking-tighter">
                                  {itemAba}
                                </span>
                              </p>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {notaUrl && (
                                <a 
                                  href={notaUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] transition-colors"
                                  title="Ver Comprovante"
                                >
                                  📎
                                </a>
                              )}
                              <button 
                                type="button"
                                onClick={() => iniciarEdicao(item)}
                                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] transition-colors"
                              >
                                Editar
                              </button>
                              <button 
                                type="button"
                                onClick={() => deletarItem(itemAba, itemId)}
                                className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-[10px] transition-colors"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {transacoesList.filter((item: any) => {
                  const itemAba = item.aba || (item.NotaFiscalUrl ? 'Gastos' : 'Ganhos');
                  const matchTipo = filtroTipo === 'todos' || itemAba === filtroTipo;
                  const nomeId = item.Identificador || item.identificador || '';
                  const matchTexto = !filtroBusca || nomeId.toLowerCase().includes(filtroBusca.toLowerCase());
                  return matchTipo && matchTexto;
                }).length === 0 && (
                  <p className="text-xs text-zinc-500 py-4 text-center">Nenhum lançamento encontrado.</p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Auxiliar para cor do saldo
function saldoReportColor(saldo: number) {
  if (saldo > 0) return 'text-emerald-400';
  if (saldo < 0) return 'text-rose-500';
  return 'text-zinc-300';
}