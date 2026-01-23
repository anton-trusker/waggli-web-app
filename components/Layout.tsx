import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import AdminSidebar from './AdminSidebar';
import BottomNav from './BottomNav';
import AIAssistant from './AIAssistant';
import { FeatureGate } from './FeatureGate';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isAdminMode } = useApp();
  const location = useLocation();
  const isPetProfile = location.pathname.startsWith('/pet/');

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark">
      {isAdminMode ? (
        <AdminSidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      ) : (
        <Sidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isPetProfile={isPetProfile}
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      <main
        className={`flex-1 flex flex-col h-full overflow-hidden relative pt-24 pb-20 lg:pb-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}
      >
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              // @ts-ignore - injecting props dynamically
              return React.cloneElement(child, { onMenuClick: () => setIsMobileOpen(true) });
            }
            return child;
          })}
        </div>
      </main>

      {/* Mobile/Tablet Bottom Navigation - Only show for normal users */}
      {!isAdminMode && <BottomNav />}

      {/* Global AI Assistant - Always available */}
      <AIAssistant />
    </div>
  );
};

export default Layout;