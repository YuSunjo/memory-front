export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

export interface MapData {
  id: number;
  name: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  mapType: string;
}

export interface MapsResponse {
  statusCode: number;
  message: string;
  data: MapData[];
}

export interface MapFormData {
  name: string;
  description: string;
  address: string;
  latitude: string;
  longitude: string;
  mapType: string; // e.g., "USER_PLACE", "FAVORITE_PLACE"
}