// types/location.types.ts
export interface LocationData {
    type?: 'current' | 'live';
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
    timestamp: number;
}

export interface LiveLocationData extends LocationData {
    isActive: boolean;
    lastUpdated: number;
    expiresAt?: number;
}

export interface LocationMessageMetadata {
    type: 'current' | 'live';
    data: LocationData | LiveLocationData;
    expiresAt?: number;
}