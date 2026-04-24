import { useLocation, Link } from 'react-router-dom';
import { TbHome, TbLayoutDashboard, TbSettingsFilled, TbCalendarMonthFilled, TbBedFilled, TbCreditCardFilled, TbUsers } from "react-icons/tb";

const Sidebar = ({
  sidebarOpen,
  dropdownOpen,
  toggleDropdown,
  sidebarBg,
  hoverBg,
  activeBg
}) => {
  const location = useLocation();

  const isManagementPage =
    location.pathname === '/accommodations' ||
    location.pathname === '/reservations' ||
    location.pathname === '/payments' ||
    location.pathname === '/users';

  const isActive = (path) => location.pathname === path;

  if (!sidebarOpen) return null;

  return (
    <div
      className="text-white vh-100 position-fixed"
      style={{
        width: '250px',
        backgroundColor: sidebarBg,
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}
    >
      {/* Logo */}
      <div className="p-4 border-bottom border-secondary">
        <h5 className="mb-0"><TbHome /> Kamang Resort</h5>
        <small className="text-light">Admin Panel</small>
      </div>

      {/* Navigation */}
      <nav className="nav flex-column p-3">
        {/* Dashboard Link */}
        <Link // ← GANTI <a> dengan <Link>
          className={`nav-link text-white py-3 rounded mb-2 ${isActive('/') ? 'active' : ''}`}
          to="/" // ← GANTI href dengan to
          style={{
            backgroundColor: isActive('/') ? activeBg : 'transparent',
            fontWeight: isActive('/') ? 'bold' : 'normal',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => !isActive('/') && (e.target.style.backgroundColor = hoverBg)}
          onMouseLeave={(e) => !isActive('/') && (e.target.style.backgroundColor = 'transparent')}
        >
          <TbLayoutDashboard /> Dashboard
        </Link>

        {/* Management Dropdown */}
        <div className="mb-2">
          <button
            className="nav-link text-white py-3 rounded w-100 text-start border-0 d-flex justify-content-between align-items-center"
            style={{
              backgroundColor: (dropdownOpen || isManagementPage) ? hoverBg : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={toggleDropdown}
            onMouseEnter={(e) => !dropdownOpen && !isManagementPage && (e.target.style.backgroundColor = hoverBg)}
            onMouseLeave={(e) => !dropdownOpen && !isManagementPage && (e.target.style.backgroundColor = 'transparent')}
          >
            <span><TbSettingsFilled /> Management</span>
            <span>{dropdownOpen ? '▲' : '▼'}</span>
          </button>

          {/* Dropdown Items */}
          {dropdownOpen && (
            <div className="ps-4 mt-2">
              <Link // ← GANTI
                className={`nav-link text-white py-2 rounded mb-1 ${isActive('/accommodations') ? 'active' : ''}`}
                to="/accommodations"
                style={{
                  backgroundColor: isActive('/accommodations') ? activeBg : 'transparent',
                  fontWeight: isActive('/accommodations') ? 'bold' : 'normal',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => !isActive('/accommodations') && (e.target.style.backgroundColor = hoverBg)}
                onMouseLeave={(e) => !isActive('/accommodations') && (e.target.style.backgroundColor = 'transparent')}
              >
                <TbBedFilled /> Accommodations
              </Link>
              
              <Link // ← GANTI
                className={`nav-link text-white py-2 rounded mb-1 ${isActive('/reservations') ? 'active' : ''}`}
                to="/reservations"
                style={{
                  backgroundColor: isActive('/reservations') ? activeBg : 'transparent',
                  fontWeight: isActive('/reservations') ? 'bold' : 'normal',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => !isActive('/reservations') && (e.target.style.backgroundColor = hoverBg)}
                onMouseLeave={(e) => !isActive('/reservations') && (e.target.style.backgroundColor = 'transparent')}
              >
                <TbCalendarMonthFilled /> Reservations
              </Link>

              <Link // ← GANTI  
                className={`nav-link text-white py-2 rounded mb-1 ${isActive('/payments') ? 'active' : ''}`}
                to="/payments"
                style={{
                  backgroundColor: isActive('/payments') ? activeBg : 'transparent',
                  fontWeight: isActive('/payments') ? 'bold' : 'normal',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => !isActive('/payments') && (e.target.style.backgroundColor = hoverBg)}
                onMouseLeave={(e) => !isActive('/payments') && (e.target.style.backgroundColor = 'transparent')}
              >
                <TbCreditCardFilled /> Payments
              </Link>

              <Link // ← GANTI
                className={`nav-link text-white py-2 rounded mb-1 ${isActive('/users') ? 'active' : ''}`}
                to="/users"
                style={{
                  backgroundColor: isActive('/users') ? activeBg : 'transparent',
                  fontWeight: isActive('/users') ? 'bold' : 'normal',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => !isActive('/users') && (e.target.style.backgroundColor = hoverBg)}
                onMouseLeave={(e) => !isActive('/users') && (e.target.style.backgroundColor = 'transparent')}
              >
                <TbUsers /> Users
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;