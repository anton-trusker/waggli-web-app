import React, { useState, useRef, useEffect } from 'react';
import { countries } from '../data/countries';

interface CountrySelectorProps {
    value: string;
    onChange: (country: string) => void;
    required?: boolean;
    className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ value, onChange, required = false, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedCountry = countries.find(c => c.name === value);
    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (countryName: string) => {
        onChange(countryName);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary dark:text-white cursor-pointer flex items-center justify-between ${className}`}
            >
                {selectedCountry ? (
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{selectedCountry.flag}</span>
                        <span>{selectedCountry.name}</span>
                    </div>
                ) : (
                    <span className="text-gray-400">Select your country</span>
                )}
                <span className="material-icons-round text-gray-400">{isOpen ? 'expand_less' : 'expand_more'}</span>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-64 overflow-hidden">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <input
                            type="text"
                            placeholder="Search countries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary dark:text-white"
                            autoFocus
                        />
                    </div>
                    <div className="overflow-y-auto max-h-52">
                        {filteredCountries.length > 0 ? (
                            filteredCountries.map((country) => (
                                <div
                                    key={country.code}
                                    onClick={() => handleSelect(country.name)}
                                    className="px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 transition-colors"
                                >
                                    <span className="text-xl">{country.flag}</span>
                                    <span className="text-sm dark:text-white">{country.name}</span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-gray-400 text-sm">
                                No countries found
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Hidden input for form validation */}
            {required && <input type="text" value={value} readOnly className="opacity-0 absolute" tabIndex={-1} required />}
        </div>
    );
};

export default CountrySelector;
