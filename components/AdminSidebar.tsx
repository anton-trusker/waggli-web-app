import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ 
  to, 
  icon, 
  label, 
  active = false, 
  onClick,
  isCollapsed 
}: { 
  to: string; 
  icon: string; 
  label: string; 
  active?: boolean, 
  onClick?: () => void;
  isCollapsed?: boolean;
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      title={isCollapsed ? label : ''}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap overflow-hidden ${
        active
          ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 dark:bg-white dark:text-gray-900'
          : 'text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${isCollapsed ? 'justify-center px-0 w-12 h-12 mx-auto' : ''}`}
    >
      <span className="material-icons-round text-xl shrink-0">{icon}</span>
      <span className={`font-medium transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>{label}</span>
    </Link>
  );
};

interface AdminSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileOpen, setIsMobileOpen, isCollapsed, toggleCollapse }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800
    transform transition-all duration-300 ease-in-out flex flex-col h-full pt-24 pb-20 lg:pb-0
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    ${isCollapsed ? 'w-20' : 'w-64'}
  `;

  const closeMobile = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeMobile}
        ></div>
      )}

      <aside className={sidebarClasses}>
        <div className="flex-1 px-4 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          <div className="pb-4 px-2">
             {!isCollapsed && <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Panel</span>}
          </div>
          
          <NavItem 
             to="/admin" 
             icon="analytics" 
             label="Dashboard" 
             active={isActive('/admin') && location.pathname === '/admin'} 
             onClick={closeMobile} 
             isCollapsed={isCollapsed}
          />
          
          <NavItem 
             to="/admin/users" 
             icon="people_alt" 
             label="User Management" 
             active={isActive('/admin/users')} 
             onClick={closeMobile} 
             isCollapsed={isCollapsed}
          />

          <NavItem 
             to="/admin/providers" 
             icon="storefront" 
             label="Service Providers" 
             active={isActive('/admin/providers')} 
             onClick={closeMobile} 
             isCollapsed={isCollapsed}
          />

          <NavItem 
             to="/admin/subscriptions" 
             icon="payments" 
             label="Subscriptions" 
             active={isActive('/admin/subscriptions')} 
             onClick={closeMobile} 
             isCollapsed={isCollapsed}
          />

          <NavItem 
             to="/admin/marketing" 
             icon="campaign" 
             label="Marketing" 
             active={isActive('/admin/marketing')} 
             onClick={closeMobile} 
             isCollapsed={isCollapsed}
          />

          <div className="pt-6 pb-2 px-4">
             {!isCollapsed && <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Platform</p>}
          </div>
          
          <NavItem 
             to="/discover" 
             icon="explore" 
             label="Manage Services" 
             onClick={closeMobile} 
             isCollapsed={isCollapsed}
          />
          <NavItem 
             to="/admin/settings" 
             icon="admin_panel_settings" 
             label="Global Settings" 
             active={isActive('/admin/settings')} 
             onClick={closeMobile} 
             isCollapsed={isCollapsed}
          />
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex justify-end p-2 border-t border-gray-100 dark:border-gray-800">
             <button 
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
             >
                 <span className="material-icons-round">{isCollapsed ? 'chevron_right' : 'chevron_left'}</span>
             </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;