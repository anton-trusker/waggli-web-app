import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../services/maps';

interface GooglePlacesInputProps {
  onSelect: (place: any) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  types?: string[];
}

const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  onSelect,
  placeholder = "Search for a location...",
  defaultValue = "",
  className = "",
  types = ['establishment', 'geocode']
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete;

    const init = async () => {
      try {
        await loadGoogleMaps();

        if (!inputRef.current) return;

        autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types, // 'establishment' for businesses, 'geocode' for addresses
          fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components', 'types', 'photos', 'rating', 'user_ratings_total']
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            onSelect({
              placeId: place.place_id,
              name: place.name,
              address: place.formatted_address,
              lat: place.geometry.location?.lat(),
              lng: place.geometry.location?.lng(),
              fullResult: place
            });
            setValue(place.name || "");
          }
        });
      } catch (error) {
        console.error("Google Places Autocomplete Error:", error);
      }
    };

    init();

    // Cleanup not strictly necessary for google maps instance but good practice to remove listeners if we could
    return () => {
      if (autocomplete) {
        google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [onSelect, types]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className={className || "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"}
    />
  );
};

export default GooglePlacesInput;
