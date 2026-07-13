import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Pill, 
  PlusCircle, 
  History, 
  TrendingUp, 
  LogOut, 
  User 
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Sidebar Nav */}
        <div className="col-md-2 sidebar d-none d-md-flex flex-column justify-content-between">
          <div>
            <div className="px-4 py-3 d-flex align-items-center gap-2">
              <Pill className="text-success" size={28} />
              <span className="fs-4 fw-bold text-white tracking-tight">Salama PMS</span>
            </div>
            
            <nav className="mt-4">
              <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </NavLink>
              
              <NavLink to="/pos" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <ShoppingCart size={20} />
                <span>POS (Billing)</span>
              </NavLink>
              
              <NavLink to="/inventory" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Pill size={20} />
                <span>Inventory</span>
              </NavLink>
              
              <NavLink to="/grn" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <PlusCircle size={20} />
                <span>Stock Intake (GRN)</span>
              </NavLink>
              
              <NavLink to="/sales-history" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <History size={20} />
                <span>Sales History</span>
              </NavLink>

              {/* Show reports ONLY to Owner */}
              {user.role === 'OWNER' && (
                <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <TrendingUp size={20} />
                  <span>Reports</span>
                </NavLink>
              )}
            </nav>
          </div>

          <div className="p-3">
            <button 
              onClick={handleLogout}
              className="btn w-100 sidebar-link border-0 text-danger d-flex align-items-center gap-3"
              style={{ backgroundColor: 'transparent' }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-md-10 min-vh-100 d-flex flex-column" style={{ backgroundColor: '#090d16' }}>
          {/* Top Header */}
          <header 
            className="px-4 py-3 d-flex justify-content-between align-items-center"
            style={{ borderBottom: '1px solid #1e293b', backgroundColor: '#0b0f19' }}
          >
            <div>
              <h5 className="text-secondary mb-0">Habari, Mambo vipi!</h5>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              {/* User role badge */}
              <span className={`badge px-3 py-2 rounded-pill font-monospace ${
                user.role === 'OWNER' ? 'bg-danger text-white' : 
                user.role === 'PHARMACIST' ? 'bg-primary text-white' : 'bg-success text-white'
              }`}>
                {user.role}
              </span>
              
              <div className="d-flex align-items-center gap-2 text-white">
                <div className="bg-secondary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                  <User size={18} />
                </div>
                <div>
                  <div className="fw-semibold lh-sm">{user.username}</div>
                  <small className="text-secondary text-xs">{user.email || 'no-email@pms.com'}</small>
                </div>
              </div>
            </div>
          </header>

          {/* Router view body */}
          <main className="p-4 flex-grow-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
