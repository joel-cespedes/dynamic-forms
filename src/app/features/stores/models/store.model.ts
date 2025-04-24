// src/app/features/stores/models/store.model.ts
export type StoreType = 'physical' | 'online' | 'hybrid';
export type PaymentMethod = 'cash' | 'card' | 'bank' | 'mobile';
export type BusinessHours = 'standard' | 'extended' | '24h';

// Interfaz base para tienda
export interface Store {
    id?: string;
    name: string;
    description: string;
    storeType: StoreType;
    foundedDate: string;
    active: boolean;
}

// Propiedades específicas para tienda física
export interface PhysicalStoreProps {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    size: number; // en m²
    businessHours: BusinessHours;
    employeeCount: number;
    hasParking: boolean;
    parkingCapacity?: number;
}

// Propiedades específicas para tienda online
export interface OnlineStoreProps {
    website: string;
    platformType: string;
    deliveryTime: number;
    shipsInternational: boolean;
    supportEmail: string;
    supportPhone?: string;
}

// Interfaces específicas para cada tipo de tienda
export interface PhysicalStore extends Store, PhysicalStoreProps {
    storeType: 'physical';
}

export interface OnlineStore extends Store, OnlineStoreProps {
    storeType: 'online';
}

export interface HybridStore extends Store, PhysicalStoreProps, OnlineStoreProps {
    storeType: 'hybrid';
}

// Tipo para formulario de tienda (se mantiene igual)
export interface StoreFormModel {
    // Campos comunes
    id?: string;
    name: string;
    description: string;
    storeType: StoreType;
    foundedDate: string;
    active: boolean;

    // Campos para tiendas físicas y híbridas
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    size?: number;
    businessHours?: BusinessHours;
    employeeCount?: number;
    hasParking?: boolean;
    parkingCapacity?: number;

    // Campos para tiendas online y híbridas
    website?: string;
    platformType?: string;
    deliveryTime?: number;
    shipsInternational?: boolean;
    supportEmail?: string;
    supportPhone?: string;

    // Métodos de pago aceptados (para todos los tipos)
    paymentMethods?: PaymentMethod[];
}