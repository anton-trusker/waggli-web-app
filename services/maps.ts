import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

let librariesLoaded = false;

export const loadGoogleMaps = async () => {
    if (librariesLoaded) return;

    if (!API_KEY) {
        console.warn('Google Maps API key missing');
        return;
    }

    setOptions({
        key: API_KEY,
        v: "weekly",
    });

    try {
        await Promise.all([
            importLibrary("maps"),
            importLibrary("places"),
            importLibrary("geometry"),
            importLibrary("geocoding")
        ]);
        librariesLoaded = true;
    } catch (error) {
        console.error("Failed to load Google Maps libraries:", error);
        throw error;
    }
};

export const geocodeAddress = async (address: string): Promise<{ lat: number, lng: number, formattedAddress: string } | null> => {
    try {
        await loadGoogleMaps();
        // Access Geocoder from global namespace after loading 'geocoding' lib
        if (typeof google === 'undefined' || !google.maps) return null;
        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({ address });

        if (response.results && response.results.length > 0) {
            const result = response.results[0];
            return {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng(),
                formattedAddress: result.formatted_address
            };
        }
        return null;
    } catch (error) {
        console.error("Geocoding Error:", error);
        return null; // Return null instead of throwing to prevent app crash
    }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
        await loadGoogleMaps();
        if (typeof google === 'undefined' || !google.maps) return null;
        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({ location: { lat, lng } });

        if (response.results && response.results.length > 0) {
            return response.results[0].formatted_address;
        }
        return null;
    } catch (error) {
        console.error("Reverse Geocoding Error:", error);
        return null;
    }
};
