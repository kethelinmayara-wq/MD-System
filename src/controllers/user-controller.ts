import { loginUser } from '../services/user-service';

export const handleLoginSubmit = async (e: React.FormEvent, { email, password, setLoading, setError, onSuccess }: any) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const resposta = await loginUser({ email, senha: password });
    
    if (resposta.status === 200) {
      onSuccess(resposta.usuario);
    } else {
      setError(resposta.mensagem || 'Credenciais inválidas.');
    }
  } catch (err) {
    setError('Erro de conexão com o servidor. Tente novamente.');
  } finally {
    setLoading(false);
  }
};