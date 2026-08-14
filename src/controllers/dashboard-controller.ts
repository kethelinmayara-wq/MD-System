import { fetchDashboardData, ResumoFinanceiroCompleto } from '../services/dashboard-service';

export const carregarDashboard = async (
  mesAno: string,
  setDados: (dados: ResumoFinanceiroCompleto) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  setLoading(true);
  setError(null);
  try {
    const dados = await fetchDashboardData(mesAno);
    setDados(dados);
  } catch (err) {
    setError('Não foi possível carregar os dados do Dashboard.');
  } finally {
    setLoading(false);
  }
};