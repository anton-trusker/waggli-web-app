/// <reference types="google.maps" />
import { loadGoogleMaps } from './maps';

declare const google: any;

export interface PlaceResult {
    place_id: string;
    name: string;
    address: string;
    rating?: number;
    user_ratings_total?: number;
    geometry?: {
        location: {
            lat: number;
            lng: number;
        }
    };
    photos?: string[];
    types?: string[];
    website?: string;
    formatted_phone_number?: string;
    opening_hours?: {
        open_now: boolean;
        weekday_text: string[];
    };
}

export const searchPlaces = async (query: string, type?: string, location?: { lat: number, lng: number }, radius: number = 5000): Promise<PlaceResult[]> => {
    try {
        await loadGoogleMaps();

        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            console.warn('Google Maps not available');
            return [];
        }

        // We need a map div even if hidden to use PlacesService (technically)
        // specific to client-side. Usually we create a dummy div.
        const mapDiv = document.createElement('div');
        const map = new google.maps.Map(mapDiv, { center: location || { lat: 0, lng: 0 }, zoom: 15 });
        const service = new google.maps.places.PlacesService(map);

        const request: google.maps.places.TextSearchRequest = {
            query,
            type,
            location: location ? new google.maps.LatLng(location.lat, location.lng) : undefined,
            radius: location ? radius : undefined
        };

        return new Promise((resolve, reject) => {
            service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    const mapped = results.map(r => ({
                        place_id: r.place_id!,
                        name: r.name!,
                        address: r.formatted_address!,
                        rating: r.rating,
                        user_ratings_total: r.user_ratings_total,
                        geometry: {
                            location: {
                                lat: r.geometry!.location!.lat(),
                                lng: r.geometry!.location!.lng()
                            }
                        },
                        types: r.types,
                        photos: r.photos?.map(p => p.getUrl({ maxWidth: 400 }))
                    }));
                    resolve(mapped);
                } else {
                    resolve([]);
                }
            });
        });
    } catch (error) {
        console.error("Google Places Search Error:", error);
        return [];
    }
};

export const getPlaceDetails = async (placeId: string): Promise<PlaceResult | null> => {
    try {
        await loadGoogleMaps();
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            console.warn('Google Maps not available');
            return null;
        }
        const mapDiv = document.createElement('div');
        const map = new google.maps.Map(mapDiv);
        const service = new google.maps.places.PlacesService(map);

        return new Promise((resolve, reject) => {
            service.getDetails({
                placeId,
                fields: ['place_id', 'name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 'photos', 'types', 'website', 'formatted_phone_number', 'opening_hours']
            }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    const result: PlaceResult = {
                        place_id: place.place_id!,
                        name: place.name!,
                        address: place.formatted_address!,
                        rating: place.rating,
                        user_ratings_total: place.user_ratings_total,
                        geometry: {
                            location: {
                                lat: place.geometry!.location!.lat(),
                                lng: place.geometry!.location!.lng()
                            }
                        },
                        types: place.types,
                        photos: place.photos?.map(p => p.getUrl({ maxWidth: 800 })),
                        website: place.website,
                        formatted_phone_number: place.formatted_phone_number,
                        opening_hours: place.opening_hours ? {
                            open_now: place.opening_hours.isOpen ? place.opening_hours.isOpen() : false,
                            weekday_text: place.opening_hours.weekday_text || []
                        } : undefined
                    };
                    resolve(result);
                } else {
                    resolve(null);
                }
            });
        });
    } catch (error) {
        console.error("Get Place Details Error:", error);
        return null;
    }
};
