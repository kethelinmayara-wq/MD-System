import React, { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginComponent from '../components/login-component';
import DashboardComponent from '../components/dashboard-component';
import FinanceComponent from '../components/finance-component';
import LayoutComponent from '../components/layout-component';

// Tempo de expiração da sessão em milissegundos (Ex: 2 horas)
const TEMPO_SESSAO = 2 * 60 * 60 * 1000; 

function RotaPrivada({ children }: { children: JSX.Element }) {
  const usuarioStr = localStorage.getItem('usuario_logado');
  const timestampStr = localStorage.getItem('sessao_timestamp');

  if (!usuarioStr || !timestampStr) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se a sessão expirou
  const agora = new Date().getTime();
  const tempoDecorrido = agora - Number(timestampStr);

  if (tempoDecorrido > TEMPO_SESSAO) {
    // Limpa a sessão vencida
    localStorage.removeItem('usuario_logado');
    localStorage.removeItem('sessao_timestamp');
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Impede que um usuário logado acesse a tela de login manualmente digitando na URL
function RotaPublica({ children }: { children: JSX.Element }) {
  const usuarioStr = localStorage.getItem('usuario_logado');
  const timestampStr = localStorage.getItem('sessao_timestamp');

  if (usuarioStr && timestampStr) {
    const agora = new Date().getTime();
    const tempoDecorrido = agora - Number(timestampStr);
    if (tempoDecorrido <= TEMPO_SESSAO) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  return children;
}

export function AppRoutes() {
  // Descobre automaticamente pelo endereço do navegador
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const basename = isLocalhost ? "" : "/MD-System";

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* Rota pública de login (se já estiver logado, manda pro dashboard) */}
        <Route 
          path="/login" 
          element={
            <RotaPublica>
              <LoginComponent />
            </RotaPublica>
          } 
        />
        
        {/* Rotas Protegidas */}
        <Route
          element={
            <RotaPrivada>
              <LayoutComponent />
            </RotaPrivada>
          }
        >
          <Route path="/dashboard" element={<DashboardComponent />} />
          <Route path="/financeiro" element={<FinanceComponent />} />
        </Route>

        {/* Qualquer outra rota desconhecida ou vazia cai direto nas regras de guarda */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}