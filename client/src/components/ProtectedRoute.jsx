import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-[100vh] min-h-[100dvh] items-center justify-center bg-ivory px-5 text-center text-charcoal">
      <div className="max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">
          DigiCloset
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Checking your wardrobe...</h1>
        <p className="mt-3 text-sm leading-6 text-stone">
          Just making sure your private closet is ready.
        </p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children || <Outlet />;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}
