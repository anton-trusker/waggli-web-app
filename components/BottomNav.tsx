import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { usePlatform } from '../context/PlatformContext';

const BottomNav = () => {
   const location = useLocation();
   const { pets } = useApp();
   const { settings } = usePlatform();
   const firstPetId = pets[0]?.id || 'max';




   const isActive = (path: string) => {
      if (path === '/' && location.pathname === '/') return true;
      if (path !== '/' && location.pathname.startsWith(path)) return true;
      return false;
   };

   return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pb-safe z-40 safe-area-bottom">
         <div className="flex items-center justify-around h-16 px-2">
            <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/') ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
               <span className="material-icons-round text-2xl">dashboard</span>
               <span className="text-[10px] font-bold">Home</span>
            </Link>

            <Link to="/pets" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/pets') ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
               <span className="material-icons-round text-2xl">pets</span>
               <span className="text-[10px] font-bold">Pets</span>
            </Link>

            <div className="relative -top-6">
               <Link
                  to={`/pet/${firstPetId}/add-record`}
                  className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
               >
                  <span className="material-icons-round text-3xl">add</span>
               </Link>
            </div>

            <Link to="/appointments" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/appointments') ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
               <span className="material-icons-round text-2xl">calendar_month</span>
               <span className="text-[10px] font-bold">Calendar</span>
            </Link>

            <Link to="/settings" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/settings') ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
               <span className="material-icons-round text-2xl">settings</span>
               <span className="text-[10px] font-bold">Settings</span>
            </Link>
         </div>
      </div>
   );
};

export default BottomNav;