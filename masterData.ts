import type { Item, UniqueData, AppSettings } from './types';

// This file contains the default data for the application.
// When an administrator makes changes and wants them to be public,
// they should use the "Export App Data" feature in the settings,
// copy the generated code, and replace the content of this file.
export const masterData: {
  items: Item[];
  quickEntryData: UniqueData;
  settings: AppSettings;
  companyLogo: string | null;
} = {
  items: [],
  quickEntryData: {
    models: ["SAM-01", "SAM-02"],
    barcodes: [],
    colors: ["أسود", "أبيض", "أزرق", "أحمر", "أخضر"],
    materials: ["قطن", "صوف", "جلد", "بوليستر"],
    prices: [50, 75, 100, 120, 150, 200],
    types: ['كلاسيكية', 'رياضية', 'شتوية', 'رسمية', 'كاجوال'],
    categories: ["قبعات", "أحذية", "ملابس"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    countries: ["تركيا", "الصين", "فيتنام", "مصر"],
  },
  settings: {
    companyName: 'SAM PRO',
    companyInfo: 'للتواصل: +963 998 171 954',
    guestCredentials: {
      enabled: true,
      username: 'visitor',
      password: '123'
    }
  },
  companyLogo: null,
};