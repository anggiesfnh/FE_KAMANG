import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('AdminProtectedRoute - loading:', loading, 'user:', user);

  // TAMPILKAN LOADING SELAMA AUTH CONTEXT MASIH LOADING
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // SETELAH LOADING SELESAI, CHECK USER
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body text-center">
                <div className="text-danger mb-3">
                  <i className="fas fa-exclamation-triangle fa-3x"></i>
                </div>
                <h4 className="card-title text-danger">Access Denied</h4>
                <p className="card-text">
                  This area is for administrators only.
                </p>
                <div className="mb-3 p-3 bg-light rounded">
                  <strong>Your Information:</strong>
                  <div className="mt-2">
                    <span className="badge bg-secondary">Role: {user.role || 'Not assigned'}</span>
                    <br />
                    <small className="text-muted">Email: {user.email}</small>
                    <br />
                    <small className="text-muted">Name: {user.name}</small>
                  </div>
                </div>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/login'}
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Go to Login
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => window.location.href = '/'}
                  >
                    <i className="fas fa-home me-2"></i>
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  console.log('Access granted for admin user:', user.name);
  return children;
};

export default AdminProtectedRoute;