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
  // Se já estiver no formato dd/mm/aaaa
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

  // Estados dos Inputs de Criação (Padronizados para 'Gastos' | 'Ganhos')
  const [tipo, setTipo] = useState<'Gastos' | 'Ganhos'>('Gastos');
  const [identificador, setIdentificador] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [data, setData] = useState<string>(new Date().toISOString().split('T')[0]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  // Estados para Edição
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editAba, setEditAba] = useState<'Gastos' | 'Ganhos'>('Gastos');
  const [editIdentificador, setEditIdentificador] = useState<string>('');
  const [editValor, setEditValor] = useState<string>('');
  const [editData, setEditData] = useState<string>('');
  const [editArquivo, setEditArquivo] = useState<File | null>(null);

  // Estados para Filtros de Busca e Listagem
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
        alert('Registrado com sucesso!');
      }, 
      setError
    );
    setEnviando(false);
  };

  const iniciarEdicao = (item: any, aba: 'Gastos' | 'Ganhos') => {
    setEditandoId(item.id || item.ID);
    setEditAba(aba);
    setEditIdentificador(item.identificador || '');
    setEditValor(String(item.valor || ''));
    // Garante que o input date receba YYYY-MM-DD perfeitamente
    setEditData(item.data ? item.data.split('T')[0] : '');
    setEditArquivo(null);
  };

  const salvarEdicao = async () => {
    if (!editandoId) return;
    setError(null);

    let notaFiscalBase64 = undefined;
    let nomeArquivo = undefined;

    if (editArquivo && editAba === 'Gastos') {
      const reader = new FileReader();
      reader.readAsDataURL(editArquivo);
      await new Promise((resolve) => {
        reader.onload = () => {
          notaFiscalBase64 = reader.result;
          nomeArquivo = editArquivo.name;
          resolve(true);
        };
      });
    }

    await handleEditarRegistro(
      editAba,
      editandoId,
      {
        identificador: editIdentificador,
        valor: Number(editValor),
        data: editData,
        notaFiscalBase64,
        nomeArquivo
      },
      () => {
        setEditandoId(null);
        setEditArquivo(null);
        atualizarDashboard();
        alert('Atualizado com sucesso!');
      },
      setError
    );
  };

  const deletarItem = async (aba: 'Gastos' | 'Ganhos', id: string) => {
    if (!window.confirm("Deseja realmente excluir este registro?")) return;
    
    await handleDeletarRegistro(
      aba,
      id,
      () => {
        atualizarDashboard();
        alert('Registro removido!');
      },
      setError
    );
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 sm:p-6 font-sans relative overflow-x-hidden">
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-950/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-950/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        
        <header className="flex justify-between items-center border-b border-zinc-900 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Dashboard Financeiro MD</h1>
            <p className="text-xs text-rose-500 uppercase tracking-widest">Painel de Controle & Lançamentos</p>
          </div>
          <button 
            onClick={atualizarDashboard}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
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

        {/* BLOCO DE INPUTS (NOVO LANÇAMENTO) */}
        <div className="bg-zinc-950/90 border border-zinc-900 p-5 rounded-2xl shadow-xl">
          <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Novo Lançamento</h2>
          
          <div className="flex bg-zinc-900 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setTipo('Gastos')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tipo === 'Gastos' ? 'bg-rose-950 text-rose-300 border border-rose-900/50' : 'text-zinc-400'}`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setTipo('Ganhos')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tipo === 'Ganhos' ? 'bg-emerald-950 text-emerald-300 border border-emerald-900/50' : 'text-zinc-400'}`}
            >
              Ganho
            </button>
          </div>

          <form onSubmit={onSubmitTransacao} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase text-zinc-500 font-semibold mb-1">Identificador</label>
              <input
                type="text"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="Ex: Conta de Água, Salário..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-600"
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
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-600"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-zinc-500 font-semibold mb-1">Data</label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-600"
                  required
                />
              </div>
            </div>

            {tipo === 'Gastos' && (
              <div>
                <label className="block text-[10px] uppercase text-zinc-500 font-semibold mb-1">Nota Fiscal / Comprovante</label>
                <input
                  type="file"
                  accept=".png, .jpg, .jpeg, .pdf"
                  onChange={(e) => setArquivo(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-rose-400 hover:file:bg-zinc-800"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 hover:from-rose-900 hover:to-rose-800 text-white font-medium py-3 rounded-xl text-sm shadow-[0_0_20px_rgba(225,29,72,0.2)] transition-all mt-2 disabled:opacity-50"
            >
              {enviando ? 'Salvando...' : 'Adicionar Registro'}
            </button>
          </form>
        </div>

        {/* LOADING / OUTPUTS DO DASHBOARD */}
        {loading ? (
          <div className="text-center py-10 text-zinc-500 animate-pulse text-sm">
            Sincronizando dados com o painel...
          </div>
        ) : resumo ? (
          <div className="space-y-4">
            
            {/* Somatórios */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-950/80 border border-zinc-900 p-4 rounded-2xl">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Total Ganhos</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  R$ {Number(resumo.somatorioGanhos || 0).toFixed(2)}
                </p>
              </div>

              <div className="bg-zinc-950/80 border border-zinc-900 p-4 rounded-2xl">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Total Gastos</span>
                <p className="text-lg font-bold text-rose-500 mt-1">
                  R$ {Number(resumo.somatorioGastos || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* LISTAGEM DE TRANSAÇÕES */}
            <div className="bg-zinc-950/80 border border-zinc-900 p-4 rounded-2xl space-y-3">
              <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Gerenciar Lançamentos (Gastos / Ganhos)</h3>
              
              {resumo.transacoes && resumo.transacoes.length > 0 ? (
                <div className="space-y-3">
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Buscar por descrição/identificador..."
                      value={filtroBusca}
                      onChange={(e) => setFiltroBusca(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-zinc-700"
                    />
                    <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-[10px]">
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

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {resumo.transacoes
                      .filter((item: any) => {
                        const matchTipo = filtroTipo === 'todos' || item.aba === filtroTipo;
                        const matchTexto = !filtroBusca || item.identificador?.toLowerCase().includes(filtroBusca.toLowerCase());
                        return matchTipo && matchTexto;
                      })
                      .map((item: any) => (
                        <div key={item.id} className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl text-xs space-y-2">
                          {editandoId === item.id ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] text-rose-400 font-bold">
                                <span>Editando ({item.aba})</span>
                              </div>
                              <input
                                type="text"
                                value={editIdentificador}
                                onChange={(e) => setEditIdentificador(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2 py-1.5 text-xs"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editValor}
                                  onChange={(e) => setEditValor(e.target.value)}
                                  className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2 py-1.5 text-xs"
                                />
                                <input
                                  type="date"
                                  value={editData}
                                  onChange={(e) => setEditData(e.target.value)}
                                  className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2 py-1.5 text-xs"
                                />
                              </div>

                              {editAba === 'Gastos' && (
                                <div>
                                  <label className="block text-[9px] uppercase text-zinc-500 font-semibold mb-1">Substituir Nota Fiscal (Opcional)</label>
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
                                  className="flex-1 bg-emerald-900/60 text-emerald-300 py-1 rounded-lg font-semibold hover:bg-emerald-900"
                                >
                                  Salvar
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setEditandoId(null)}
                                  className="flex-1 bg-zinc-800 text-zinc-300 py-1 rounded-lg font-semibold hover:bg-zinc-700"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-white font-semibold">{item.identificador}</p>
                                <p className="text-[10px] text-zinc-400">
                                  {/* APLICADO FORMATADOR PARA DD/MM/AAAA */}
                                  {formatarDataBR(item.data)} • <span className={item.aba === 'Ganhos' ? 'text-emerald-400' : 'text-rose-400'}>R$ {Number(item.valor).toFixed(2)}</span> ({item.aba})
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button 
                                  type="button"
                                  onClick={() => iniciarEdicao(item, item.aba)}
                                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px]"
                                >
                                  Editar
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => deletarItem(item.aba, item.id)}
                                  className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-[10px]"
                                >
                                  Excluir
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                    {resumo.transacoes.filter((item: any) => {
                      const matchTipo = filtroTipo === 'todos' || item.aba === filtroTipo;
                      const matchTexto = !filtroBusca || item.identificador?.toLowerCase().includes(filtroBusca.toLowerCase());
                      return matchTipo && matchTexto;
                    }).length === 0 && (
                      <p className="text-xs text-zinc-500 py-2 text-center">Nenhum lançamento encontrado com esses critérios.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">Nenhuma transação listada ou o backend não retornou o array `transacoes` no JSON de resumo.</p>
              )}
            </div>

            {/* Notas Fiscais */}
            <div className="bg-zinc-950/80 border border-zinc-900 p-4 rounded-2xl space-y-2">
              <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Notas Fiscais e Comprovantes</h3>
              {resumo.notasFiscais && resumo.notasFiscais.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {resumo.notasFiscais.map((nota: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-zinc-900 p-2 rounded-xl text-xs">
                      <div>
                        <p className="text-white font-medium">{nota.identificador}</p>
                        {/* APLICADO FORMATADOR AQUI TAMBÉM */}
                        <p className="text-[10px] text-zinc-500">{formatarDataBR(nota.data)}</p>
                      </div>
                      <a 
                        href={nota.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-rose-950/60 border border-rose-900 text-rose-300 rounded-lg text-xs hover:bg-rose-900 transition-colors"
                      >
                        Ver Documento ↗
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 pt-1">Nenhuma nota fiscal encontrada.</p>
              )}
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}