import kamangLogo from './../assets/kamang.png'
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = ({ sidebarOpen, toggleSidebar, activeBg }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white p-3 border-bottom shadow-sm d-flex justify-content-between align-items-center">
      <div>
        <button 
          className="btn btn-outline-secondary border-0"
          onClick={toggleSidebar}
          style={{ fontSize: '1.2rem' }}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <span className="ms-3 fw-bold text-dark">
          {location.pathname === '/' && 'Dashboard'}
          {location.pathname === '/users' && 'User Management'}
          {location.pathname === '/accommodations' && 'Accommodation Management'}
          {location.pathname === '/reservations' && 'Reservation Management'} 
          {location.pathname === '/payments' && 'Payment Management'}
          {location.pathname === '/users' && 'User Management'}
        </span>
      </div>
      
      <div className="d-flex align-items-center">
        <small className="text-muted me-3">Welcome, {user?.name || 'Admin'}</small>
        <button 
          className="btn text-white" 
          style={{ backgroundColor: activeBg }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      
    </header>
  );
};

export default Header;
{/* <img src={kamangLogo} alt="Kamang Logo" height="60" /> */}