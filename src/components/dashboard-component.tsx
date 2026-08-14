import React, { useEffect, useState, useRef } from 'react';
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

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

const obterMesVigenteAtual = () => {
  const data = new Date();
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
};

export default function DashboardComponent() {
  const [cacheDados, setCacheDados] = useState<Record<string, ResumoFinanceiroCompleto>>({});
  const [dados, setDados] = useState<ResumoFinanceiroCompleto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mesAtual, setMesAtual] = useState<string>(obterMesVigenteAtual());

  const cacheDadosRef = useRef(cacheDados);
  cacheDadosRef.current = cacheDados;

  const buscarOuCarregarMes = (mes: string, forcarAtualizacao = false) => {
    if (!forcarAtualizacao && cacheDadosRef.current[mes]) {
      setDados(cacheDadosRef.current[mes]);
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
      carregarDashboard(
        mes, 
        (resultado) => {
          setCacheDados(prev => ({ ...prev, [mes]: resultado }));
          setDados(resultado);
          setLoading(false);
        }, 
        setLoading, 
        setError
      );
    }
  };

  useEffect(() => {
    buscarOuCarregarMes(mesAtual);
  }, [mesAtual]);

  const avancarMes = () => {
    const [ano, mes] = mesAtual.split('-').map(Number);
    const data = new Date(ano, mes, 1);
    setMesAtual(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`);
  };

  const voltarMes = () => {
    const [ano, mes] = mesAtual.split('-').map(Number);
    const data = new Date(ano, mes - 2, 1);
    setMesAtual(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`);
  };

  const formatarMesExibicao = (mesAnoStr: string) => {
    if (!mesAnoStr) return '';
    const [ano, mes] = mesAnoStr.split('-').map(Number);
    return new Date(ano, mes - 1, 2).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const transacoesList = (dados as any)?.transacoes || [];
  const gastosDoMes = transacoesList.filter((t: any) => t.aba === 'Gastos');
  
  const maioresGastosCalculados = gastosDoMes.reduce((acc: Record<string, number>, transacao: any) => {
    const id = transacao.Identificador.trim();
    acc[id] = (acc[id] || 0) + transacao.Valor;
    return acc;
  }, {} as Record<string, number>);

  const identificadoresKeys = Object.keys(maioresGastosCalculados);
  const identificadoresValues = Object.values(maioresGastosCalculados);

  // Cálculo comparativo mês anterior
  const [anoAtualNum, mesAtualNum] = mesAtual.split('-').map(Number);
  const dataAnteriorObj = new Date(anoAtualNum, mesAtualNum - 2, 1);
  const mesAnteriorStr = `${dataAnteriorObj.getFullYear()}-${String(dataAnteriorObj.getMonth() + 1).padStart(2, '0')}`;
  
  const dadosMesAnterior = cacheDados[mesAnteriorStr];
  const totalGastosMesAtual = dados?.somatorioGastos || 0;
  const totalGastosMesAnterior = dadosMesAnterior?.somatorioGastos;

  let diferencaGastosPercentual = null;
  if (totalGastosMesAnterior !== undefined && totalGastosMesAnterior > 0) {
    diferencaGastosPercentual = ((totalGastosMesAtual - totalGastosMesAnterior) / totalGastosMesAnterior) * 100;
  }

  // Obter mês anterior e atual para o gráfico de linha de evolução de 2 meses
  const lineChartData = {
    labels: [formatarMesExibicao(mesAnteriorStr), formatarMesExibicao(mesAtual)],
    datasets: [
      { 
        label: 'Ganhos (R$)', 
        data: [dadosMesAnterior?.somatorioGanhos || 0, dados?.somatorioGanhos || 0], 
        borderColor: '#34d399', 
        backgroundColor: 'rgba(52, 211, 153, 0.05)', 
        fill: true, 
        tension: 0.4 
      },
      { 
        label: 'Gastos (R$)', 
        data: [dadosMesAnterior?.somatorioGastos || 0, dados?.somatorioGastos || 0], 
        borderColor: '#e11d48', 
        backgroundColor: 'rgba(225, 29, 72, 0.08)', 
        fill: true, 
        tension: 0.4 
      },
    ],
  };

  const lineChartOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    scales: { y: { beginAtZero: true } } 
  };

  const doughnutChartData = {
    labels: identificadoresKeys,
    datasets: [{ 
      data: identificadoresValues, 
      backgroundColor: ['#e11d48', '#be123c', '#9f1239', '#fda4af', '#f43f5e', '#52525b', '#f472b6', '#fb7185'], 
      borderWidth: 0 
    }],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-4 sm:p-8 font-sans relative overflow-x-hidden selection:bg-rose-950 selection:text-rose-200">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-950/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5 gap-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Dashboard Financeiro</h1>
          <div className="flex items-center space-x-3">
            <button onClick={() => setMesAtual(obterMesVigenteAtual())} className="text-[10px] text-zinc-500 hover:text-rose-500 uppercase font-bold transition-colors">Hoje</button>
            <button onClick={() => buscarOuCarregarMes(mesAtual, true)} className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white transition-all text-xs font-semibold">🔄 Atualizar</button>
          </div>
        </header>

        <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-900 p-3 rounded-2xl backdrop-blur-md">
          <button onClick={voltarMes} className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold">← Mês Anterior</button>
          <span className="text-sm font-black text-white capitalize">{formatarMesExibicao(mesAtual)}</span>
          <button onClick={avancarMes} className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold">Próximo Mês →</button>
        </div>

        {loading ? (
            <div className="py-32 text-center text-zinc-500 uppercase tracking-widest text-xs">Processando...</div>
        ) : error ? (
            <div className="py-20 text-center text-rose-500 text-xs">{error}</div>
        ) : dados ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl">
                <span className="text-[10px] uppercase text-zinc-500 font-bold">Total Ganhos</span>
                <p className="text-xl font-black text-emerald-400 mt-3">R$ {dados.somatorioGanhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl">
                <span className="text-[10px] uppercase text-zinc-500 font-bold">Total Gastos</span>
                <p className="text-xl font-black text-rose-500 mt-3">R$ {dados.somatorioGastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                {diferencaGastosPercentual !== null && (
                  <p className={`text-[10px] font-bold mt-2 ${diferencaGastosPercentual <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {diferencaGastosPercentual <= 0 ? '↓' : '↑'} {Math.abs(diferencaGastosPercentual).toFixed(1)}% vs. mês anterior
                  </p>
                )}
              </div>
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl">
                <span className="text-[10px] uppercase text-zinc-500 font-bold">Gastos (Mês Anterior)</span>
                <p className="text-xl font-black text-white mt-3">
                  {dadosMesAnterior ? `R$ ${dadosMesAnterior.somatorioGastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                </p>
              </div>
              <div className="bg-zinc-950 border border-rose-900/30 p-5 rounded-2xl">
                <span className="text-[10px] uppercase text-rose-400 font-bold">Margem Geral</span>
                <p className={`text-xl font-black mt-3 ${dados.margemGeral === 'Positiva' ? 'text-emerald-400' : 'text-rose-400'}`}>{dados.margemGeral}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl lg:col-span-2 h-72 flex flex-col">
                <h2 className="text-xs font-bold text-zinc-300 uppercase mb-4">Comparativo com Mês Anterior</h2>
                <div className="flex-1 relative w-full h-full">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl flex flex-col h-72">
                <h2 className="text-xs font-bold text-zinc-300 uppercase mb-4">Distribuição de Gastos</h2>
                <div className="flex-1 relative flex items-center justify-center w-full h-full">
                  {identificadoresKeys.length > 0 ? <Doughnut data={doughnutChartData} options={doughnutChartOptions} /> : <p className="text-zinc-600 text-xs">Sem gastos registrados.</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl">
                <h2 className="text-xs font-bold text-zinc-300 uppercase mb-4">Detalhes por Mês</h2>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {Object.entries(dados.balancoPorMes).map(([mes, info]) => (
                    <div key={mes} className="bg-zinc-900/40 p-3 rounded-xl text-xs">
                      <div className="flex justify-between font-bold text-white">
                        <span>{formatarMesExibicao(mes)}</span>
                        <span className={info.status === 'Positivo' ? 'text-emerald-400' : 'text-rose-400'}>R$ {info.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl">
                <h2 className="text-xs font-bold text-zinc-300 uppercase mb-4">Notas Fiscais ({dados.notasFiscais?.length || 0})</h2>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {dados.notasFiscais?.map((nf, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-zinc-900/50 p-2.5 rounded-xl text-xs">
                      <p className="font-bold">{nf.identificador}</p>
                      <a href={nf.url} target="_blank" rel="noreferrer" className="text-rose-400 font-bold hover:underline">Ver ↗</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}