import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import Layanan from './pages/Layanan';
import Berita from './pages/Berita';
import BeritaDetail from './pages/BeritaDetail';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminNewsForm from './pages/AdminNewsForm';
import InstallPrompt from './components/InstallPrompt';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

// Route Guard for Authenticated Users
const PrivateRoute: React.FC<{ children: React.ReactNode; allowedRole?: string }> = ({
  children,
  allowedRole
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole) {
    console.log('Validating access for role:', allowedRole);
  }

  if (allowedRole && user.role?.slug !== allowedRole) {
    // Redirect role to their correct dashboard
    if (user.role?.slug === 'super-admin') return <Navigate to="/admin" replace />;
    if (user.role?.slug === 'petugas') return <Navigate to="/officer" replace />;
    return <Navigate to="/customer" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/layanan" element={<Layanan />} />
        <Route path="/berita" element={<Berita />} />
        <Route path="/berita/:slug" element={<BeritaDetail />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Customer Dashboard */}
      <Route
        path="/customer/*"
        element={
          <PrivateRoute allowedRole="pelanggan">
            <CustomerDashboard />
          </PrivateRoute>
        }
      />

      {/* Protected Officer Dashboard */}
      <Route
        path="/officer/*"
        element={
          <PrivateRoute allowedRole="petugas">
            <OfficerDashboard />
          </PrivateRoute>
        }
      />

      {/* Protected Admin Dashboard */}
      <Route
        path="/admin/news/create"
        element={
          <PrivateRoute allowedRole="super-admin">
            <AdminNewsForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/news/edit/:id"
        element={
          <PrivateRoute allowedRole="super-admin">
            <AdminNewsForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRole="super-admin">
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <CompanyProvider>
          <AppRoutes />
          <InstallPrompt />
        </CompanyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
