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
