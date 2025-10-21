import React, { useState, useMemo, useEffect } from 'react';
import type { Item, Filters, UniqueData, AppSettings, User, ItemType, BackupData } from './types';
import { masterData } from './masterData';
import Header from './components/Header';
import HatForm from './components/HatForm';
import FilterControls from './components/FilterControls';
import HatGrid from './components/HatGrid';
import HatDetailModal from './components/HatDetailModal';
import SettingsModal from './components/SettingsModal';
import ItemsSidebar from './components/ItemsSidebar';
import Login from './components/Login';
import { PlusIcon } from './components/Icons';

// Helper function to initialize state from localStorage, with a fallback to masterData
const initializeState = <T,>(key: string, masterValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    // If there is saved data, use it.
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error(`Failed to parse ${key} from localStorage`, error);
  }
  // Otherwise, use the master value from masterData.ts
  return masterValue;
};


const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
        const savedUsers = localStorage.getItem('samProUsers');
        if (savedUsers) {
            return JSON.parse(savedUsers);
        }
        // Create a default admin user if none exist
        const adminUser: User = {
            id: crypto.randomUUID(),
            username: 'admin',
            password: 'admin', // Default password
            permissions: {
                canAdd: true,
                canDelete: true,
                canChangeSettings: true,
            }
        };
        localStorage.setItem('samProUsers', JSON.stringify([adminUser]));
        return [adminUser];
    } catch (error) {
        console.error("Failed to initialize users", error);
        return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = sessionStorage.getItem('samProCurrentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Items are now initialized empty and loaded via useEffect based on user type.
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState<boolean>(false);
  const [isItemsSidebarVisible, setIsItemsSidebarVisible] = useState<boolean>(false);
  
  const [companyLogo, setCompanyLogo] = useState<string | null>(() => 
    initializeState('samProLogo', masterData.companyLogo)
  );

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
  
  const [quickEntryData, setQuickEntryData] = useState<UniqueData>(() =>
    initializeState('samProQuickEntry', masterData.quickEntryData)
  );

  const [settings, setSettings] = useState<AppSettings>(() => {
    const masterSettings = masterData.settings;
    try {
      const saved = localStorage.getItem('samProSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Deep merge to ensure new properties from masterData are included
        return {
          ...masterSettings,
          ...parsed,
          guestCredentials: {
            ...masterSettings.guestCredentials,
            ...(parsed.guestCredentials || {}),
          },
        };
      }
    } catch (error) {
      console.error(`Failed to parse settings from localStorage`, error);
    }
    return masterSettings;
  });
  
  // This effect handles loading the correct item data based on the current user.
  useEffect(() => {
    if (currentUser) {
      // If the user is a guest, they always see the published masterData.
      if (currentUser.id === 'guest-user') {
        setItems(masterData.items);
      } else {
        // Admins and other registered users load their own data from localStorage.
        setItems(initializeState('samProItems', masterData.items));
      }
    } else {
      // When no user is logged in (e.g., at the login screen), clear items.
      setItems([]);
    }
  }, [currentUser]);


  // This effect saves items to localStorage only when they change and the user is not a guest.
  useEffect(() => {
    if (currentUser && currentUser.id !== 'guest-user') {
      localStorage.setItem('samProItems', JSON.stringify(items));
    }
  }, [items, currentUser]);


  useEffect(() => {
    // Use JSON.stringify to handle null values correctly
    localStorage.setItem('samProLogo', JSON.stringify(companyLogo));
  }, [companyLogo]);

  useEffect(() => {
    localStorage.setItem('samProQuickEntry', JSON.stringify(quickEntryData));
  }, [quickEntryData]);

  useEffect(() => {
    localStorage.setItem('samProSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('samProUsers', JSON.stringify(users));
  }, [users]);

  // --- Auth and User Management ---
  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem('samProCurrentUser', JSON.stringify(user));
      return true;
    }

    // Check for guest user if admin login fails
    if (
        settings.guestCredentials.enabled &&
        settings.guestCredentials.username === username &&
        settings.guestCredentials.password === password
    ) {
        const guestUser: User = {
            id: 'guest-user',
            username: `${username} (زائر)`,
            password: '', // Do not store password in session
            permissions: {
                canAdd: false,
                canDelete: false,
                canChangeSettings: false,
            }
        };
        setCurrentUser(guestUser);
        sessionStorage.setItem('samProCurrentUser', JSON.stringify(guestUser));
        return true;
    }

    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('samProCurrentUser');
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: crypto.randomUUID() };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If the current user is the one being updated, update their session
    if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
        sessionStorage.setItem('samProCurrentUser', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (userId: string) => {
    if (currentUser?.id === userId) {
        alert('لا يمكنك حذف حسابك الخاص.');
        return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  };


  type QuickEntryCategory = keyof UniqueData;

  const addQuickEntryItem = (category: QuickEntryCategory, value: string) => {
    if (!currentUser?.permissions.canAdd) {
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
    if (!currentUser?.permissions.canAdd) {
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
     if (!currentUser?.permissions.canDelete) {
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
    if (!currentUser?.permissions.canAdd) {
      alert('ليس لديك الصلاحية لإضافة أصناف.');
      return;
    }
    setItems(prevItems => [{ ...newItem, id: crypto.randomUUID() }, ...prevItems]);
    setIsFormVisible(false);
  };
  
  const handleUpdateItem = (updatedItem: Item) => {
    if (!currentUser?.permissions.canAdd) {
      alert('ليس لديك الصلاحية لتعديل الأصناف.');
      return;
    }
    setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
    setIsFormVisible(false);
    setEditingItem(null);
  };

  const deleteItem = (itemId: string) => {
    if (!currentUser?.permissions.canDelete) {
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

  const getUniqueFilterOptions = (key: keyof Item, quickEntryKey: keyof UniqueData) => {
    const fromItems = items.map(item => item[key]).filter(Boolean) as string[];
    const fromQuickEntry = quickEntryData[quickEntryKey] as string[];
    return [...new Set([...fromItems, ...fromQuickEntry])].sort();
  };
  
  const handleImportData = (data: BackupData) => {
    if (data && Array.isArray(data.items) && data.quickEntryData && data.settings) {
        setItems(data.items);
        setQuickEntryData(data.quickEntryData);
        setSettings(data.settings);
        setCompanyLogo(data.companyLogo);
        alert('تم استيراد البيانات بنجاح!');
        setIsSettingsVisible(false); // Close modal on success
    } else {
        alert('فشل استيراد البيانات. الملف غير صالح أو تالف.');
    }
  };

  const uniqueCountries = useMemo(() => getUniqueFilterOptions('country', 'countries'), [items, quickEntryData.countries]);
  const uniqueColors = useMemo(() => getUniqueFilterOptions('color', 'colors'), [items, quickEntryData.colors]);
  const uniqueMaterials = useMemo(() => getUniqueFilterOptions('material', 'materials'), [items, quickEntryData.materials]);
  const uniqueCategories = useMemo(() => getUniqueFilterOptions('category', 'categories'), [items, quickEntryData.categories]);
  const uniqueSizes = useMemo(() => getUniqueFilterOptions('size', 'sizes'), [items, quickEntryData.sizes]);
  const uniqueTypes = useMemo(() => {
    const fromItems = items.map(item => item.type).filter(Boolean);
    const fromQuickEntry = quickEntryData.types;
    return [...new Set([...fromItems, ...fromQuickEntry])].sort();
  }, [items, quickEntryData.types]);


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

  if (!currentUser) {
    return <Login onLogin={handleLogin} companyName={settings.companyName} companyLogo={companyLogo} />;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200">
      <Header 
        companyLogo={companyLogo} 
        onLogoUpload={handleLogoUpload} 
        settings={settings}
        onOpenSettings={() => setIsSettingsVisible(true)}
        onOpenItemsSidebar={() => setIsItemsSidebarVisible(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-white">إدارة الأصناف</h1>
          <p className="text-lg text-zinc-400 mt-2">تصفح وأدر مخزونك بسهولة.</p>
        </div>

        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 p-8 rounded-xl shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-serif text-white">مجموعتنا</h2>
              {currentUser.permissions.canAdd && (
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
                onUpdateQuickEntryItem={updateQuickEntryItem}
                onDeleteItem={deleteQuickEntryItem}
                permissions={currentUser.permissions}
              />
            )}
        </div>

        <FilterControls 
            filters={filters} 
            setFilters={setFilters}
            countries={uniqueCountries}
            types={uniqueTypes}
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
            canDelete={currentUser.permissions.canDelete}
            canEdit={currentUser.permissions.canAdd}
        />
      )}

      {isSettingsVisible && (
        <SettingsModal 
            settings={settings} 
            onClose={() => setIsSettingsVisible(false)} 
            onSave={setSettings} 
            users={users}
            currentUser={currentUser}
            onAddUser={addUser}
            onUpdateUser={updateUser}
            onDeleteUser={deleteUser}
            onImportData={handleImportData}
        />
      )}
    </div>
  );
};

export default App;