import React, { useState, useMemo, useEffect } from 'react';
import type { Item, Filters, UniqueData, AppSettings } from './types';
import { INITIAL_ITEMS } from './constants';
import Header from './components/Header';
import HatForm from './components/HatForm';
import FilterControls from './components/FilterControls';
import HatGrid from './components/HatGrid';
import HatDetailModal from './components/HatDetailModal';
import SettingsModal from './components/SettingsModal';
import ItemsSidebar from './components/ItemsSidebar';
import { PlusIcon } from './components/Icons';

const EMPTY_QUICK_ENTRY_DATA: UniqueData = {
  models: [],
  barcodes: [],
  colors: [],
  materials: [],
  prices: [],
  types: [],
  categories: [],
  sizes: [],
  countries: [],
};

const DEFAULT_SETTINGS: AppSettings = {
    companyName: 'SAM PRO',
    companyInfo: '',
    permissions: {
        canAdd: true,
        canDelete: true,
        canChangeSettings: true,
    }
};

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const savedItems = localStorage.getItem('samProItems');
      return savedItems ? JSON.parse(savedItems) : INITIAL_ITEMS;
    } catch (error) {
      console.error("Failed to parse items from localStorage", error);
      return INITIAL_ITEMS;
    }
  });

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState<boolean>(false);
  const [isItemsSidebarVisible, setIsItemsSidebarVisible] = useState<boolean>(false);
  
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => {
    return localStorage.getItem('samProLogo');
  });

  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    type: 'الكل',
    country: '',
    barcode: '',
    category: '',
    size: '',
    color: '',
    material: '',
  });
  
  const [quickEntryData, setQuickEntryData] = useState<UniqueData>(() => {
    try {
      const savedData = localStorage.getItem('samProQuickEntry');
      return savedData ? JSON.parse(savedData) : EMPTY_QUICK_ENTRY_DATA;
    } catch (error) {
      console.error("Failed to initialize quick entry data", error);
      return EMPTY_QUICK_ENTRY_DATA;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
      try {
          const savedSettings = localStorage.getItem('samProSettings');
          const parsed = savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
          // Ensure permissions object exists
          return { ...DEFAULT_SETTINGS, ...parsed, permissions: { ...DEFAULT_SETTINGS.permissions, ...parsed.permissions } };
      } catch (error) {
          console.error("Failed to parse settings from localStorage", error);
          return DEFAULT_SETTINGS;
      }
  });
  
  useEffect(() => {
    localStorage.setItem('samProItems', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (companyLogo) {
      localStorage.setItem('samProLogo', companyLogo);
    } else {
      localStorage.removeItem('samProLogo');
    }
  }, [companyLogo]);

  useEffect(() => {
    localStorage.setItem('samProQuickEntry', JSON.stringify(quickEntryData));
  }, [quickEntryData]);

  useEffect(() => {
    localStorage.setItem('samProSettings', JSON.stringify(settings));
  }, [settings]);


  type QuickEntryCategory = keyof UniqueData;

  const addQuickEntryItem = (category: QuickEntryCategory, value: string) => {
    if (!settings.permissions.canAdd) {
      alert('ليس لديك الصلاحية للإضافة إلى قائمة الإدخال السريع.');
      return;
    }
    if (category === 'prices') {
      const numValue = parseFloat(value);
      if (!numValue || numValue <= 0 || quickEntryData.prices.includes(numValue)) return;
      setQuickEntryData(prev => ({
        ...prev,
        prices: [...prev.prices, numValue].sort((a, b) => a - b)
      }));
    } else {
      const trimmedValue = value.trim();
      if (!trimmedValue || (quickEntryData[category] as string[]).includes(trimmedValue)) return;
      setQuickEntryData(prev => ({
        ...prev,
        [category]: [...(prev[category] as string[]), trimmedValue].sort()
      }));
    }
  };

  const updateQuickEntryItem = (category: QuickEntryCategory, oldValue: string, newValue: string) => {
    if (!settings.permissions.canAdd) {
      alert('ليس لديك الصلاحية للتعديل في قائمة الإدخال السريع.');
      return;
    }
    if (category === 'prices') {
        const oldNum = parseFloat(oldValue);
        const newNum = parseFloat(newValue);
        if (!newNum || newNum <= 0 || (newNum !== oldNum && quickEntryData.prices.includes(newNum))) return;
        setQuickEntryData(prev => ({
            ...prev,
            prices: prev.prices.map(item => item === oldNum ? newNum : item).sort((a, b) => a - b)
        }));
    } else {
        const trimmedValue = newValue.trim();
        if (!trimmedValue || (trimmedValue !== oldValue && (quickEntryData[category] as string[]).includes(trimmedValue))) return;
        setQuickEntryData(prev => ({
            ...prev,
            [category]: (prev[category] as string[]).map(item => item === oldValue ? trimmedValue : item).sort()
        }));
    }
  };

  const deleteQuickEntryItem = (category: QuickEntryCategory, value: string) => {
     if (!settings.permissions.canDelete) {
        alert('ليس لديك الصلاحية للحذف من قائمة الإدخال السريع.');
        return;
      }
     if (category === 'prices') {
        const numValue = parseFloat(value);
        setQuickEntryData(prev => ({
            ...prev,
            prices: prev.prices.filter(item => item !== numValue)
        }));
    } else {
        setQuickEntryData(prev => ({
            ...prev,
            [category]: (prev[category] as string[]).filter(item => item !== value)
        }));
    }
  };

  const handleLogoUpload = (logoDataUrl: string) => {
    setCompanyLogo(logoDataUrl);
  };

  const addItem = (newItem: Omit<Item, 'id'>) => {
    if (!settings.permissions.canAdd) {
      alert('ليس لديك الصلاحية لإضافة أصناف.');
      return;
    }
    setItems(prevItems => [{ ...newItem, id: crypto.randomUUID() }, ...prevItems]);
    setIsFormVisible(false);
  };
  
  const handleUpdateItem = (updatedItem: Item) => {
    if (!settings.permissions.canAdd) {
      alert('ليس لديك الصلاحية لتعديل الأصناف.');
      return;
    }
    setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    setIsFormVisible(false);
    setEditingItem(null);
  };

  const deleteItem = (itemId: string) => {
    if (!settings.permissions.canDelete) {
        alert('ليس لديك الصلاحية لحذف الأصناف.');
        return;
    }
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    setSelectedItem(null); // Close the modal after deletion
  }

  const handleEditStart = (item: Item) => {
    setSelectedItem(null);
    setEditingItem(item);
    setIsFormVisible(true);
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingItem(null);
  };


  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const searchTermMatch = item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
                              item.model.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const typeMatch = filters.type === 'الكل' || item.type === filters.type;
      const countryMatch = filters.country === '' || item.country === filters.country;
      const barcodeMatch = filters.barcode === '' || item.barcode.includes(filters.barcode);
      const categoryMatch = filters.category === '' || item.category === filters.category;
      const sizeMatch = filters.size === '' || item.size === filters.size;
      const colorMatch = filters.color === '' || item.color === filters.color;
      const materialMatch = filters.material === '' || item.material === filters.material;
      return searchTermMatch && typeMatch && countryMatch && barcodeMatch && categoryMatch && sizeMatch && colorMatch && materialMatch;
    });
  }, [items, filters]);
  
  const uniqueCountries = useMemo(() => [...new Set(items.map(item => item.country).filter(Boolean))].sort(), [items]);
  const uniqueColors = useMemo(() => [...new Set(items.map(item => item.color).filter(Boolean))].sort(), [items]);
  const uniqueMaterials = useMemo(() => [...new Set(items.map(item => item.material).filter(Boolean))].sort(), [items]);
  const uniqueCategories = useMemo(() => [...new Set(items.map(item => item.category).filter(Boolean))].sort(), [items]);
  const uniqueSizes = useMemo(() => [...new Set(items.map(item => item.size).filter(Boolean))].sort(), [items]);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200">
      <Header 
        companyLogo={companyLogo} 
        onLogoUpload={handleLogoUpload} 
        settings={settings}
        onOpenSettings={() => setIsSettingsVisible(true)}
        onOpenItemsSidebar={() => setIsItemsSidebarVisible(true)}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-white">إدارة الأصناف</h1>
          <p className="text-lg text-zinc-400 mt-2">تصفح وأدر مخزونك بسهولة.</p>
        </div>

        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 p-8 rounded-xl shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-serif text-white">مجموعتنا</h2>
              {settings.permissions.canAdd && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsFormVisible(!isFormVisible);
                  }}
                  className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-500 transition-all duration-300 shadow-md transform hover:scale-105"
                >
                  <PlusIcon />
                  {isFormVisible ? (editingItem ? 'إغلاق التعديل' : 'إغلاق النموذج') : 'إضافة صنف جديد'}
                </button>
              )}
          </div>
           {isFormVisible && (
              <HatForm 
                onAddItem={addItem} 
                onUpdateItem={handleUpdateItem}
                itemToEdit={editingItem}
                onCancel={handleCancelForm} 
                uniqueData={quickEntryData}
                onAddQuickEntryItem={addQuickEntryItem}
                // FIX: The `onUpdateItem` prop was duplicated. Renamed to `onUpdateQuickEntryItem` to avoid conflicts.
                onUpdateQuickEntryItem={updateQuickEntryItem}
                onDeleteItem={deleteQuickEntryItem}
                permissions={settings.permissions}
              />
            )}
        </div>

        <FilterControls 
            filters={filters} 
            setFilters={setFilters}
            countries={uniqueCountries}
            types={quickEntryData.types}
            colors={uniqueColors}
            materials={uniqueMaterials}
            categories={uniqueCategories}
            sizes={uniqueSizes}
        />
        
        <HatGrid items={filteredItems} onSelectItem={setSelectedItem} />
      </main>

      <ItemsSidebar
        isOpen={isItemsSidebarVisible}
        onClose={() => setIsItemsSidebarVisible(false)}
        items={items}
        onSelectItem={(item) => {
          setSelectedItem(item);
          setIsItemsSidebarVisible(false);
        }}
      />

      {selectedItem && (
        <HatDetailModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            onDelete={deleteItem}
            onEdit={handleEditStart}
            canDelete={settings.permissions.canDelete}
            canEdit={settings.permissions.canAdd}
        />
      )}

      {isSettingsVisible && (
        <SettingsModal 
            settings={settings} 
            onClose={() => setIsSettingsVisible(false)} 
            onSave={setSettings} 
        />
      )}
    </div>
  );
};

export default App;