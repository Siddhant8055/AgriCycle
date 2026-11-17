import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const LegalInfoPage = lazy(() => import('./pages/auth/LegalInfoPage'));
const FarmerDashboard = lazy(() => import('./pages/farmer/FarmerDashboard'));
const AddListingPage = lazy(() => import('./pages/farmer/AddListingPage'));
const RecommendationsPage = lazy(() => import('./pages/farmer/RecommendationsPage'));
const ListingsPage = lazy(() => import('./pages/farmer/ListingsPage'));
const FarmerListingDetailPage = lazy(() => import('./pages/farmer/ListingDetailPage'));
const FarmerRequestsPage = lazy(() => import('./pages/farmer/RequestsPage'));
const FarmerPickupsPage = lazy(() => import('./pages/farmer/PickupsPage'));
const AnalyticsPage = lazy(() => import('./pages/farmer/AnalyticsPage'));
const FarmerSettingsPage = lazy(() => import('./pages/farmer/SettingsPage'));
const BuyerMarketplace = lazy(() => import('./pages/buyer/BuyerMarketplace'));
const GeoSearchPage = lazy(() => import('./pages/buyer/GeoSearchPage'));
const BuyerListingDetailPage = lazy(() => import('./pages/buyer/ListingDetailPage'));
const BuyerRequestsPage = lazy(() => import('./pages/buyer/RequestsPage'));
const RequirementsPage = lazy(() => import('./pages/buyer/RequirementsPage'));
const BuyerPickupsPage = lazy(() => import('./pages/buyer/PickupsPage'));
const SuppliersPage = lazy(() => import('./pages/buyer/SuppliersPage'));
const BuyerSettingsPage = lazy(() => import('./pages/buyer/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ProtectedRoute({ allowedRole }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace'} replace />;
  }
  return <Outlet />;
}

function PublicOnlyRoute() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace'} replace />;
  }
  return <Outlet />;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
  return <Navigate to="/buyer/marketplace" replace />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="page-loading" role="status">Loading page...</div>}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/terms" element={<LegalInfoPage />} />
          <Route path="/privacy" element={<LegalInfoPage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRole="farmer" />}>
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/listings" element={<ListingsPage />} />
            <Route path="/farmer/listings/new" element={<AddListingPage />} />
            <Route path="/farmer/listings/:id" element={<FarmerListingDetailPage />} />
            <Route path="/farmer/listings/:id/recommendations" element={<RecommendationsPage />} />
            <Route path="/farmer/requests" element={<FarmerRequestsPage />} />
            <Route path="/farmer/pickups" element={<FarmerPickupsPage />} />
            <Route path="/farmer/analytics" element={<AnalyticsPage />} />
            <Route path="/farmer/settings" element={<FarmerSettingsPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRole="buyer" />}>
            <Route path="/buyer/marketplace" element={<BuyerMarketplace />} />
            <Route path="/buyer/geo" element={<GeoSearchPage />} />
            <Route path="/buyer/listings/:id" element={<BuyerListingDetailPage />} />
            <Route path="/buyer/requests" element={<BuyerRequestsPage />} />
            <Route path="/buyer/requirements" element={<RequirementsPage />} />
            <Route path="/buyer/pickups" element={<BuyerPickupsPage />} />
            <Route path="/buyer/suppliers" element={<SuppliersPage />} />
            <Route path="/buyer/settings" element={<BuyerSettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
