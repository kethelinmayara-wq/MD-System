import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function LayoutComponent() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('usuario_logado');
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans">
      {/* Barra de Navegação Superior */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <span className="font-bold tracking-tight text-white text-base">MD <span className="text-rose-500">System</span></span>
          
          <nav className="flex space-x-2">
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-rose-950/60 border border-rose-900/50 text-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.15)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/financeiro')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive('/financeiro')
                  ? 'bg-rose-950/60 border border-rose-900/50 text-rose-300 shadow-[0_0_15px_rgba(225,29,72,0.15)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              Financeiro & Lançamentos
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-zinc-400 hover:text-rose-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl transition-colors"
        >
          Sair
        </button>
      </header>

      {/* Conteúdo Dinâmico da Rota Ativa */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Rodapé Fixo na Base */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 py-4 px-6 text-center text-xs text-zinc-500">
        Desenvolvido por{' '}
        <a
          href="https://github.com/Davez99"
          target="_blank"
          rel="noopener noreferrer"
          className="text-rose-400 font-semibold hover:underline hover:text-rose-300 transition-colors"
        >
          Davi Terres
        </a>
      </footer>
    </div>
  );
}