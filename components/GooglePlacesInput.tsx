/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../services/maps';

declare const google: any;


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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let element: any = null;

    const init = async () => {
      try {
        await loadGoogleMaps();
        // @ts-ignore: PlaceAutocompleteElement might not be in legacy types
        const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");

        if (!containerRef.current) return;

        element = new PlaceAutocompleteElement();
        element.placeholder = placeholder;
        // Attempt to style: The element is a web component, so standard inputs styles don't apply deep inside.
        // We set width to 100% to fill the container.
        element.style.width = '100%';
        element.style.backgroundColor = 'transparent';

        // Listen for selection
        element.addEventListener('gmp-places-select', async (e: any) => {
          const place = e.place;
          // Fetch details: id, displayName, formattedAddress, location
          // Note: displayName returns specific object in new API?
          await place.fetchFields({ fields: ['id', 'displayName', 'formattedAddress', 'location'] });

          onSelect({
            placeId: place.id,
            name: place.displayName,
            address: place.formattedAddress,
            lat: place.location?.lat(),
            lng: place.location?.lng(),
            fullResult: place
          });
        });

        // Clear and append
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(element);

      } catch (error) {
        console.error("Google Places Init Error:", error);
      }
    };

    init();

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [onSelect]);

  return (
    <div ref={containerRef} className={className} style={{ minHeight: '40px' }} />
  );
};

export default GooglePlacesInput;
