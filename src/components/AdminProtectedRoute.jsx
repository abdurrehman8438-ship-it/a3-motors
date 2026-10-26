import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminProtectedRoute = () => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-cream flex items-center justify-center">
        <p className="text-gold">Checking admin access...</p>
      </div>
      
    );
  }

  // User login nahi hai
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User admin nahi hai
  if (userData?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Admin hai
  return <Outlet />;
};

export default AdminProtectedRoute;