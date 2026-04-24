import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./layout/layout";
import Dashboard from "./pages/Dashboard";
import Accommodation from "./pages/Accommodation";
import Reservation from "./pages/Reservation";
import PaymentManagement from "./pages/Payment";
import UserManagement from "./pages/UserManagement";
import AdminLogin from "./pages/AdminLogin";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route - Admin Login */}
          <Route path="/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route path="/" element={
            <AdminProtectedRoute>
              <Layout><Dashboard /></Layout>
            </AdminProtectedRoute>
          } />

          <Route path="/reservations" element={
            <AdminProtectedRoute>
              <Layout><Reservation /></Layout>
            </AdminProtectedRoute>
          } />

          <Route path="/users" element={
            <AdminProtectedRoute>
              <Layout><UserManagement /></Layout>
            </AdminProtectedRoute>
          } />

          <Route path="/accommodations" element={
            <AdminProtectedRoute>
              <Layout><Accommodation /></Layout>
            </AdminProtectedRoute>
          } />

          <Route path="/payments" element={
            <AdminProtectedRoute>
              <Layout><PaymentManagement /></Layout>
            </AdminProtectedRoute>
          } />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;