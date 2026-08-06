import React, { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginComponent from '../components/login-component';
import DashboardComponent from '../components/dashboard-component';
import FinanceComponent from '../components/finance-component';
import LayoutComponent from '../components/layout-component';

// Componente de Guarda de Rota
function RotaPrivada({ children }: { children: JSX.Element }) {
  const usuario = localStorage.getItem('usuario_logado');
  return usuario ? children : <Navigate to="/login" replace />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        
        {/* Rotas Protegidas envolvidas pelo Layout com Menu Superior */}
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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}