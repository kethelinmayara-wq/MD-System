import React, { useState } from 'react';
import { loginUser } from '../services/user-service';

const UserComponent = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMensagemErro(null);

    try {
      const response = await loginUser({ email, senha: password });

      if (response.status === 200) {
        // Salva os dados do usuário ou token na sessão/localStorage se necessário
        localStorage.setItem('@financeiro_user', JSON.stringify(response.usuario));
        alert(`Bem-vindo, ${response.usuario.nome}!`);
        // window.location.href = '/dashboard'; // Redirecionar se necessário
      } else {
        setMensagemErro(response.mensagem || 'Erro ao realizar login.');
      }
    } catch (error) {
      setMensagemErro('Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center px-4 sm:px-6 relative overflow-hidden font-sans">
      
      {/* Efeito de luz de fundo futurista (Glow Bordô) */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-rose-950/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-red-950/30 rounded-full blur-3xl pointer-events-none"></div>

      <section className="w-full max-w-sm bg-zinc-950/80 backdrop-blur-xl border border-zinc-900 rounded-2xl p-6 sm:p-8 shadow-[0_0_30px_rgba(136,19,55,0.15)] relative z-10">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-xl bg-gradient-to-br from-rose-950 to-zinc-900 border border-rose-900/30 mb-3 shadow-[0_0_15px_rgba(225,29,72,0.2)]">
            <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Acesse o Sistema</h2>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">Painel Financeiro MD</p>
        </div>

        {/* Mensagem de Erro */}
        {mensagemErro && (
          <div className="mb-4 p-3 bg-rose-950/50 border border-rose-900/50 text-rose-300 text-xs rounded-lg text-center animate-pulse">
            {mensagemErro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition-all placeholder:text-zinc-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600 transition-all placeholder:text-zinc-600"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 hover:from-rose-800 hover:to-rose-900 text-white font-medium py-3.5 px-4 rounded-xl text-sm shadow-[0_4px_20px_rgba(225,29,72,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span>Entrar no Sistema</span>
              )}
            </button>
          </div>

          <div className="text-center pt-3">
            <a
              href="/subscribe"
              className="text-xs text-zinc-400 hover:text-rose-400 transition-colors tracking-wide"
            >
              Não tem uma conta? <span className="text-rose-500 font-medium underline">Cadastre-se</span>
            </a>
          </div>
        </form>
      </section>
    </div>
  );
};

export default UserComponent;