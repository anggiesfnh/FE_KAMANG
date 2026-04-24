import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './SideBar';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  
  const sidebarBg = "#2d4a35";
  const hoverBg = "#3a5a42";
  const activeBg = "#4a7856";

  // Auto buka dropdown kalo di management page
  const isManagementPage = 
    location.pathname === '/reservations' || 
    location.pathname === '/accommodations' || 
    location.pathname === '/payments';

  useState(() => {
    if (isManagementPage) {
      setDropdownOpen(true);
    }
  }, [isManagementPage]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  return (
    <div className="d-flex">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        dropdownOpen={dropdownOpen}
        toggleDropdown={toggleDropdown}
        sidebarBg={sidebarBg}
        hoverBg={hoverBg}
        activeBg={activeBg}
      />

      <div 
        className="flex-grow-1 bg-light" 
        style={{ 
          marginLeft: sidebarOpen ? '250px' : '0',
          transition: 'all 0.3s ease',
          minHeight: '100vh'
        }}
      >
        <Header 
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          activeBg={activeBg}
        />
        
        <main className="p-4" style={{ minHeight: 'calc(100vh - 76px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;