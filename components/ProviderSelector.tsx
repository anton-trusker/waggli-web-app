
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceProvider } from '../types';
import GooglePlacesInput from './GooglePlacesInput';

interface ProviderSelectorProps {
  label?: string;
  onSelect: (providerName: string, address: string, providerId?: string, fullDetails?: any) => void;
  initialName?: string;
  placeholder?: string;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ 
  label = "Business / Provider", 
  onSelect, 
  initialName = '', 
  placeholder = "Search clinics, vets, or type custom..."
}) => {
  const { services, registerAsProvider } = useApp();
  const [isManual, setIsManual] = useState(false);
  const [manualName, setManualName] = useState(initialName);

  // When a Google Place is selected
  const handleGoogleSelect = async (place: any) => {
      // Check if this provider already exists in our DB by googlePlaceId
      const existing = services.find(s => s.googlePlaceId === place.placeId);
      
      if (existing) {
          onSelect(existing.name, existing.address, existing.id, existing);
      } else {
          // If not, we pass the data up. The parent component might choose to save it 
          // or we can optimistically create a "shadow" provider here.
          // For now, we pass all details so the parent form can use them (e.g. address)
          onSelect(place.name, place.address, undefined, place);
      }
  };

  if (isManual) {
      return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-500 uppercase">{label}</label>
                <button onClick={() => setIsManual(false)} className="text-[10px] text-primary hover:underline">Search Maps</button>
            </div>
            <input 
                type="text"
                value={manualName}
                onChange={(e) => {
                    setManualName(e.target.value);
                    onSelect(e.target.value, '');
                }}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
                placeholder="Enter name manually"
            />
        </div>
      );
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-xs font-bold text-gray-500 uppercase">{label}</label>
        <button onClick={() => setIsManual(true)} className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Enter Manually</button>
      </div>
      <div className="relative">
          <GooglePlacesInput 
            onSelect={handleGoogleSelect}
            defaultValue={initialName}
            placeholder={placeholder}
            className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary dark:text-white"
          />
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">storefront</span>
      </div>
    </div>
  );
};

export default ProviderSelector;
