export type ItemType = 'كلاسيكية' | 'رياضية' | 'شتوية' | 'رسمية' | 'كاجوال' | string;

export interface Item {
  id: string;
  image: string; // Base64 data URL
  name: string;
  model: string;
  barcode: string;
  type: ItemType;
  category: string;
  size: string;
  color: string;
  material: string;
  country: string;
  price: number;
  description: string;
}

export interface Filters {
    searchTerm: string;
    type: ItemType | 'الكل';
    country: string;
    barcode: string;
    category: string;
    size: string;
    color: string;
    material: string;
}

export interface UniqueData {
    models: string[];
    barcodes: string[];
    colors: string[];
    materials: string[];
    prices: number[];
    types: ItemType[];
    categories: string[];
    sizes: string[];
    countries: string[];
}

export interface UserPermissions {
    canAdd: boolean;
    canDelete: boolean;
    canChangeSettings: boolean;
}

export interface User {
  id: string;
  username: string;
  password: string; // NOTE: In a real-world application, this should be a securely stored hash.
  permissions: UserPermissions;
}

export interface AppSettings {
    companyName: string;
    companyInfo: string;
    guestCredentials: {
        enabled: boolean;
        username: string;
        password: string;
    };
}

export interface BackupData {
  items: Item[];
  quickEntryData: UniqueData;
  settings: AppSettings;
  companyLogo: string | null;
}