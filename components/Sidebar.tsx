import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePlatform } from '../context/PlatformContext';
import { useFeature } from '../context/FeatureFlagContext';

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
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap overflow-hidden ${active
        ? 'bg-primary text-white shadow-lg shadow-primary/30'
        : 'text-text-muted-light dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-700'
        } ${isCollapsed ? 'justify-center px-0 w-12 h-12 mx-auto' : ''}`}
    >
      <span className="material-icons-round text-xl shrink-0">{icon}</span>
      <span className={`font-medium transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>{label}</span>
    </Link>
  );
};

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isPetProfile?: boolean;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen, isCollapsed, toggleCollapse }) => {
  const location = useLocation();
  const { pets, providerProfile } = useApp();
  const { settings } = usePlatform();
  const { isEnabled: servicesEnabled } = useFeature('services');
  const { isEnabled: providerEnabled } = useFeature('provider_portal');
  const [expanded, setExpanded] = useState({ pets: true, health: true });

  // Get first pet ID for quick actions default link
  const firstPetId = pets.length > 0 ? pets[0].id : 'max';

  // Simple active check
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const toggle = (section: 'pets' | 'health') => {
    if (isCollapsed) {
      toggleCollapse();
      // Short delay to allow expansion before toggling accordion
      setTimeout(() => setExpanded(prev => ({ ...prev, [section]: true })), 150);
    } else {
      setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    }
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
          <NavItem
            to="/"
            icon="dashboard"
            label="Dashboard"
            active={isActive('/') && location.pathname === '/'}
            onClick={closeMobile}
            isCollapsed={isCollapsed}
          />

          <div className="space-y-1 pt-2">
            {!isCollapsed ? (
              <>
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors group ${isActive('/pets') ? 'bg-primary/5 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-text-muted-light dark:text-text-muted-dark'}`}>
                  <Link to="/pets" className="flex items-center gap-3 flex-1" onClick={closeMobile}>
                    <span className="material-icons-round text-xl">pets</span>
                    <span className="font-medium">My Pets</span>
                  </Link>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle('pets'); }}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="material-icons-round text-xl opacity-50">
                      {expanded.pets ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded.pets ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pl-4 space-y-1 ml-6 border-l-2 border-gray-100 dark:border-gray-800 my-1">
                    {pets.map(pet => (
                      <Link
                        key={pet.id}
                        to={`/pet/${pet.id}`}
                        onClick={closeMobile}
                        className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sm group ${location.pathname.startsWith(`/pet/${pet.id}`)
                          ? 'text-primary font-bold bg-primary/5'
                          : 'text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full overflow-hidden border ${location.pathname.startsWith(`/pet/${pet.id}`) ? 'border-primary' : 'border-transparent group-hover:border-gray-300'}`}>
                          <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="truncate">{pet.name}</span>
                      </Link>
                    ))}
                    <Link
                      to="/add-pet"
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sm text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="w-5 h-5 rounded-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                        <span className="material-icons-round text-[10px]">add</span>
                      </div>
                      <span>Add Pet</span>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <NavItem
                to="/pets"
                icon="pets"
                label="My Pets"
                active={isActive('/pets')}
                onClick={() => toggle('pets')} // Clicking in mini mode expands
                isCollapsed={true}
              />
            )}
          </div>

          <div className="space-y-1 mt-2">
            {!isCollapsed ? (
              <>
                <button
                  onClick={() => toggle('health')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-text-muted-light dark:text-text-muted-dark group"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-icons-round text-xl">medical_services</span>
                    <span className="font-medium">Health</span>
                  </div>
                  <span className="material-icons-round text-xl opacity-50">
                    {expanded.health ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded.health ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pl-4 space-y-1 ml-6 border-l-2 border-gray-100 dark:border-gray-800 my-1">
                    <Link
                      to={`/pet/${firstPetId}/add-record?type=vaccination`}
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sm text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                    >
                      <span className="material-icons-round text-lg">vaccines</span>
                      <span>+ Vaccination</span>
                    </Link>
                    <Link
                      to={`/pet/${firstPetId}/add-record?type=medication`}
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sm text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                    >
                      <span className="material-icons-round text-lg">medication</span>
                      <span>+ Medication</span>
                    </Link>
                    <Link
                      to={`/pet/${firstPetId}/add-record?type=vitals`}
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sm text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                    >
                      <span className="material-icons-round text-lg">monitor_weight</span>
                      <span>+ Vitals</span>
                    </Link>
                    <Link
                      to={`/pet/${firstPetId}/add-record?type=checkup`}
                      onClick={closeMobile}
                      className="flex items-center gap-3 px-4 py-2 rounded-xl transition-all text-sm text-text-muted-light dark:text-text-muted-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                    >
                      <span className="material-icons-round text-lg">local_hospital</span>
                      <span>+ Checkup</span>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <NavItem
                to={`/pet/${firstPetId}/add-record`}
                icon="medical_services"
                label="Health"
                active={location.pathname.includes('add-record')}
                onClick={() => toggle('health')}
                isCollapsed={true}
              />
            )}
          </div>

          <div className="pt-6 pb-2 px-4">
            {!isCollapsed && <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Planning</p>}
          </div>
          <NavItem to="/appointments" icon="calendar_month" label="Calendar" active={isActive('/appointments')} onClick={closeMobile} isCollapsed={isCollapsed} />

          {servicesEnabled && (
            <>
              <div className="pt-6 pb-2 px-4">
                {!isCollapsed && <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Services</p>}
              </div>

              <NavItem to="/discover" icon="explore" label="Discover" active={isActive('/discover')} onClick={closeMobile} isCollapsed={isCollapsed} />
              <NavItem to="/favorites" icon="favorite" label="Favorites" active={isActive('/favorites')} onClick={closeMobile} isCollapsed={isCollapsed} />
            </>
          )}

          <div className="my-2 border-t border-gray-100 dark:border-gray-800"></div>

          {providerEnabled && (
            providerProfile ? (
              <NavItem
                to="/provider/dashboard"
                icon="storefront"
                label="Provider Portal"
                active={isActive('/provider/dashboard')}
                onClick={closeMobile}
                isCollapsed={isCollapsed}
              />
            ) : (
              <NavItem
                to="/provider/register"
                icon="work"
                label="Become a Provider"
                active={isActive('/provider/register')}
                onClick={closeMobile}
                isCollapsed={isCollapsed}
              />
            )
          )}
        </div>

        <div className="p-4 mt-auto border-t border-gray-100 dark:border-gray-800 space-y-1">
          <NavItem to="/settings" icon="settings" label="Settings" active={isActive('/settings')} onClick={closeMobile} isCollapsed={isCollapsed} />
          <NavItem to="/support" icon="help" label="Help & Support" active={isActive('/support')} onClick={closeMobile} isCollapsed={isCollapsed} />
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

export default Sidebar;