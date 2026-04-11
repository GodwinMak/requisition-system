import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import StockManagement from './pages/StockManagement';
import CreateStock from './pages/CreateStock';
import AdminUsers from './pages/AdminUsers';
import Settings from './pages/Settings';
import { authHelper } from './lib/auth';

const Dashboard = () => (
  <div className="space-y-6">
    <h2 className="font-headline text-5xl font-extrabold text-primary tracking-tighter uppercase">Dashboard</h2>
    <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest mt-2">Operational Analytics & System Health</p>
  </div>
);

export default function App() {
  const isAuthenticated = authHelper.isAuthenticated();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Authenticated Application Shell */}
        <Route path="/dashboard" element={
          isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />
        } />

        <Route path="/stock" element={
          isAuthenticated ? <Layout><StockManagement /></Layout> : <Navigate to="/login" />
        } />
        
        <Route path="/stock/create" element={
          isAuthenticated ? <Layout><CreateStock /></Layout> : <Navigate to="/login" />
        } />

        <Route path="/admin/users" element={
          isAuthenticated ? <Layout><AdminUsers /></Layout> : <Navigate to="/login" />
        } />

        <Route path="/settings" element={
          isAuthenticated ? <Layout><Settings /></Layout> : <Navigate to="/login" />
        } />

        <Route path="/requisitions" element={
          isAuthenticated ? (
            <Layout>
              <div className="py-20 text-center opacity-30">
                <p className="font-headline font-bold text-2xl uppercase tracking-[0.3em]">Requisition Portal Pending</p>
              </div>
            </Layout>
          ) : <Navigate to="/login" />
        } />

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}