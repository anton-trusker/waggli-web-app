import { Loader } from '@googlemaps/js-api-loader';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const loader = new Loader({
    apiKey: API_KEY,
    version: "weekly",
    libraries: ["places", "geometry"]
});

export const loadGoogleMaps = async () => {
    return loader.load();
};

export const geocodeAddress = async (address: string): Promise<{ lat: number, lng: number, formattedAddress: string } | null> => {
    try {
        await loader.load();
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
        return null;
    }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
        await loader.load();
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
