import React, { useEffect, useState } from 'react';
import { carregarDashboard } from '../controllers/dashboard-controller';
import { ResumoFinanceiroCompleto } from '../services/dashboard-service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Registrando os componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardComponent() {
  const [dados, setDados] = useState<ResumoFinanceiroCompleto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarDashboard(setDados, setLoading, setError);
  }, []);

  // Configuração dos dados para o Gráfico de Linha (Balanço Mensal: Ganhos x Gastos)
  const mesesKeys = dados?.balancoPorMes ? Object.keys(dados.balancoPorMes) : [];
  const ganhosData = mesesKeys.map((mes) => dados?.balancoPorMes?.[mes]?.ganhos || 0);
  const gastosData = mesesKeys.map((mes) => dados?.balancoPorMes?.[mes]?.gastos || 0);

  const lineChartData = {
    labels: mesesKeys,
    datasets: [
      {
        label: 'Ganhos (R$)',
        data: ganhosData,
        borderColor: '#34d399', // Esmeralda
        backgroundColor: 'rgba(52, 211, 153, 0.05)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
      {
        label: 'Gastos (R$)',
        data: gastosData,
        borderColor: '#e11d48', // Bordô/Rosa Escuro (Sua identidade visual)
        backgroundColor: 'rgba(225, 29, 72, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#a1a1aa',
          font: { size: 11, family: 'sans-serif' },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(39, 39, 42, 0.4)' },
        ticks: { color: '#71717a', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(39, 39, 42, 0.4)' },
        ticks: { color: '#71717a', font: { size: 10 } },
      },
    },
  };

  // Configuração dos dados para o Gráfico de Pizza/Rosca (Maiores Gastos por Identificador)
  const identificadoresKeys = dados?.maioresGastosPorIdentificador ? Object.keys(dados.maioresGastosPorIdentificador) : [];
  const identificadoresValues = identificadoresKeys.map((iden) => dados?.maioresGastosPorIdentificador?.[iden] || 0);

  const doughnutChartData = {
    labels: identificadoresKeys,
    datasets: [
      {
        data: identificadoresValues,
        backgroundColor: [
          '#e11d48', // Bordô principal
          '#be123c', // Bordô escuro
          '#9f1239', // Bordô mais fechado
          '#fda4af', // Rosa claro
          '#f43f5e', // Rosa vivo
          '#52525b', // Cinza escuro
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#a1a1aa',
          font: { size: 10, family: 'sans-serif' },
          boxWidth: 12,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 sm:p-8 font-sans relative overflow-x-hidden selection:bg-rose-950 selection:text-rose-200">
      
      {/* Glows de Fundo Futuristas */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-950/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-red-950/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        {/* Cabeçalho */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
              <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Painel Analítico com Gráficos</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1">Dashboard Financeiro</h1>
          </div>

          <button 
            onClick={() => carregarDashboard(setDados, setLoading, setError)}
            className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800/80 text-zinc-300 hover:text-white hover:border-rose-900/60 transition-all shadow-lg active:scale-95 text-xs font-semibold"
          >
            <span>🔄</span>
            <span>Atualizar Dados</span>
          </button>
        </header>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs rounded-2xl text-center backdrop-blur-md">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <div className="w-8 h-8 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-500 text-xs tracking-wider uppercase">Processando balanços e gráficos...</p>
          </div>
        ) : dados ? (
          <div className="space-y-6">
            
            {/* GRID DE MÉTRICAS PRINCIPAIS (2.4, 2.5, 2.7, 2.8) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-b from-zinc-950 to-zinc-950/80 border border-zinc-900 p-5 rounded-2xl shadow-xl">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Total Ganhos</span>
                <p className="text-xl font-black text-emerald-400 mt-3 tracking-tight">
                  R$ {Number(dados.somatorioGanhos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-gradient-to-b from-zinc-950 to-zinc-950/80 border border-zinc-900 p-5 rounded-2xl shadow-xl">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Total Gastos</span>
                <p className="text-xl font-black text-rose-500 mt-3 tracking-tight">
                  R$ {Number(dados.somatorioGastos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="bg-gradient-to-b from-zinc-950 to-zinc-950/80 border border-zinc-900 p-5 rounded-2xl shadow-xl">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Média Gasta/Mês</span>
                <p className="text-xl font-black text-white mt-3 tracking-tight">R$ {dados.mediaGastaPorMes}</p>
              </div>

              <div className="bg-gradient-to-b from-rose-950/30 via-zinc-950 to-zinc-950 border border-rose-900/30 p-5 rounded-2xl shadow-xl">
                <span className="text-[10px] uppercase tracking-wider text-rose-400/80 font-bold">Margem Geral</span>
                <p className={`text-xl font-black mt-3 tracking-tight ${dados.margemGeral === 'Positiva' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {dados.margemGeral}
                </p>
              </div>
            </div>

            {/* SEÇÃO DE GRÁFICOS (LINHA & ROSCA) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Gráfico de Linha: Evolução de Ganhos vs Gastos (Ocupa 2 colunas) */}
              <div className="bg-zinc-950/90 border border-zinc-900/90 p-5 rounded-2xl shadow-xl lg:col-span-2 flex flex-col justify-between">
                <div className="border-b border-zinc-900 pb-3 mb-4">
                  <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Evolução Mensal (Ganhos vs Gastos)
                  </h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Comparativo visual de fluxo financeiro</p>
                </div>
                <div className="w-full h-[260px] flex items-center justify-center">
                  {mesesKeys.length > 0 ? (
                    <Line data={lineChartData} options={lineChartOptions} />
                  ) : (
                    <p className="text-xs text-zinc-600">Sem dados suficientes para o gráfico de linha.</p>
                  )}
                </div>
              </div>

              {/* Gráfico de Rosca/Pizza: Maiores Gastos por Categoria (Ocupa 1 coluna) */}
              <div className="bg-zinc-950/90 border border-zinc-900/90 p-5 rounded-2xl shadow-xl lg:col-span-1 flex flex-col justify-between">
                <div className="border-b border-zinc-900 pb-3 mb-2">
                  <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Distribuição de Gastos
                  </h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Gastos por identificador</p>
                </div>
                <div className="w-full h-[240px] flex items-center justify-center">
                  {identifiersHasData(identificadoresValues) ? (
                    <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                  ) : (
                    <p className="text-xs text-zinc-600 text-center">Nenhum gasto categorizado para exibir.</p>
                  )}
                </div>
              </div>

            </div>

            {/* SEÇÃO DE BALANÇOS DETALHADOS E NOTAS FISCAIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Balanço Mensal Detalhado */}
              <div className="bg-zinc-950/90 border border-zinc-900/90 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="border-b border-zinc-900 pb-3">
                  <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Detalhes por Mês</h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Variações percentuais e saldos</p>
                </div>
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {Object.entries(dados.balancoPorMes || {}).map(([mes, info]) => {
                    const comp = dados.comparativoMesAMes?.find(c => c.mes === mes);
                    return (
                      <div key={mes} className="bg-zinc-900/40 border border-zinc-800/70 p-3 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="text-white">{mes}</span>
                          <span className={info.status === 'Positivo' ? 'text-emerald-400' : 'text-rose-400'}>
                            R$ {info.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({info.status})
                          </span>
                        </div>
                        {comp && (
                          <div className="text-[10px] text-rose-300/80 flex justify-between pt-1 border-t border-zinc-800/40">
                            <span>Variação vs {comp.comparadoCom}:</span>
                            <span className="font-semibold">{comp.variacaoPercentual}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2.6 Notas Fiscais */}
              <div className="bg-zinc-950/90 border border-zinc-900/90 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
                  <div>
                    <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Notas Fiscais</h2>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Comprovantes armazenados</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-zinc-900 text-zinc-400 rounded-lg">
                    {dados.notasFiscais?.length || 0} arquivos
                  </span>
                </div>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {dados.notasFiscais && dados.notasFiscais.length > 0 ? (
                    dados.notasFiscais.map((nf, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded-xl text-xs">
                        <div>
                          <p className="font-bold text-white">{nf.identificador}</p>
                          <p className="text-[10px] text-zinc-500">{nf.data ? new Date(nf.data).toLocaleDateString('pt-BR') : ''}</p>
                        </div>
                        <a
                          href={nf.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-rose-950 border border-rose-900/60 text-rose-300 rounded-lg text-[11px] font-medium hover:bg-rose-900"
                        >
                          Ver ↗
                        </a>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-600 text-center py-10">Nenhuma nota fiscal encontrada.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}

// Função auxiliar simples para verificar se há dados nos gastos
function identifiersHasData(values: number[]): boolean {
  return values.some(val => val > 0);
}