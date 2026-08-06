import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, createUser } from '../services/user-service';

export default function LoginComponent() {
  const [isCadastrando, setIsCadastrando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'erro' | 'sucesso' } | null>(null);

  // Campos do formulário
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);

    try {
      if (isCadastrando) {
        //console.log('Enviando dados de cadastro:', { nome, sobrenome, email, senha, telefone });
        const res = await createUser({ nome, sobrenome, email, senha, telefone });
        //console.log('Resposta bruta do cadastro:', res);

        if (res.status === 201) {
          setMensagem({ texto: 'Conta criada com sucesso! Faça login.', tipo: 'sucesso' });
          setIsCadastrando(false);
          setSenha('');
        } else {
          setMensagem({ texto: res.mensagem || 'Erro ao cadastrar.', tipo: 'erro' });
        }
      } else {
        //console.log('Enviando dados de login:', { email, senha });
        const res = await loginUser({ email, senha });
        //console.log('Resposta bruta do login:', res);

        if (res.status === 200) {
          localStorage.setItem('usuario_logado', JSON.stringify(res.usuario));
          navigate('/dashboard');
        } else {
          setMensagem({ texto: res.mensagem || 'E-mail ou senha incorretos.', tipo: 'erro' });
        }
      }
    } catch (err) {
      //console.error('Erro na requisição:', err);
      setMensagem({ texto: 'Erro de comunicação com o servidor.', tipo: 'erro' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Efeito Glow */}
      <div className="absolute w-[450px] h-[450px] bg-rose-950/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-sm bg-zinc-950/90 border border-zinc-900 p-6 rounded-2xl shadow-xl relative z-10 space-y-5">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-white">
            {isCadastrando ? 'Criar Nova Conta' : 'Acesso Restrito'}
          </h1>
          <p className="text-xs text-rose-500 uppercase tracking-widest">Módulo Financeiro</p>
        </div>

        {/* Mensagens de Feedback */}
        {mensagem && (
          <div className={`p-3 text-xs rounded-xl text-center border ${
            mensagem.tipo === 'sucesso' 
              ? 'bg-emerald-950/50 border-emerald-900/50 text-emerald-300' 
              : 'bg-rose-950/50 border-rose-900/50 text-rose-300'
          }`}>
            {mensagem.texto}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isCadastrando && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-medium">Nome</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-900"
                  placeholder="Nome"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400 font-medium">Sobrenome</label>
                <input
                  type="text"
                  required
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-900"
                  placeholder="Sobrenome"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 font-medium">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-900"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-zinc-400 font-medium">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-900"
              placeholder="••••••••"
            />
          </div>

          {isCadastrando && (
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 font-medium">Telefone</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-900"
                placeholder="(00) 00000-0000"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-rose-950 hover:bg-rose-900 border border-rose-900/50 text-rose-200 text-xs font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'Processando...' : isCadastrando ? 'Cadastrar Conta' : 'Entrar no Sistema'}
          </button>
        </form>

        {/* Alternador de Modo */}
        <div className="text-center pt-2 border-t border-zinc-900">
          <button
            type="button"
            onClick={() => {
              setIsCadastrando(!isCadastrando);
              setMensagem(null);
            }}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            {isCadastrando ? 'Já possui uma conta? Faça login' : 'Não tem uma conta? **Cadastre-se**'}
          </button>
        </div>

      </div>
    </div>
  );
}