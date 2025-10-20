import React, { useState, useEffect } from 'react';
import type { Item, ItemType, UniqueData, AppSettings } from '../types';
import { UploadIcon } from './Icons';
import FormSidebar from './FormSidebar';

type QuickEntryCategory = keyof UniqueData;

interface HatFormProps {
  onAddItem: (item: Omit<Item, 'id'>) => void;
  onUpdateItem: (item: Item) => void;
  itemToEdit: Item | null;
  onCancel: () => void;
  uniqueData: UniqueData;
  onAddQuickEntryItem: (category: QuickEntryCategory, value: string) => void;
  // FIX: Renamed prop to `onUpdateQuickEntryItem` to avoid conflict with `onUpdateItem` for the main item.
  onUpdateQuickEntryItem: (category: QuickEntryCategory, oldValue: string, newValue: string) => void;
  onDeleteItem: (category: QuickEntryCategory, value: string) => void;
  permissions: AppSettings['permissions'];
}

const HatForm: React.FC<HatFormProps> = ({ 
    onAddItem, 
    // FIX: `onUpdateItem` is aliased to `onUpdateHatItem` for clarity.
    onUpdateItem: onUpdateHatItem,
    itemToEdit,
    onCancel, 
    uniqueData, 
    onAddQuickEntryItem, 
    // FIX: Destructured the renamed prop `onUpdateQuickEntryItem`.
    onUpdateQuickEntryItem, 
    onDeleteItem, 
    permissions 
}) => {
  const initialFormState = {
    name: '',
    type: uniqueData.types[0] || ('' as ItemType),
    category: '',
    size: '',
    color: '',
    material: '',
    country: '',
    price: 0,
    description: '',
    image: '',
    model: '',
    barcode: ''
  };
  
  const [formData, setFormData] = useState<Omit<Item, 'id'> | Item>(initialFormState);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const isEditMode = !!itemToEdit;

  useEffect(() => {
    if (itemToEdit) {
      setFormData(itemToEdit);
      setImagePreview(itemToEdit.image);
    } else {
      setFormData(initialFormState);
      setImagePreview(null);
    }
  }, [itemToEdit]);
  
  const inputStyles = "mt-1 block w-full rounded-lg border-zinc-600 bg-zinc-700 text-white shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-base transition-colors duration-200 placeholder:text-zinc-400 px-4 py-2.5";


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          setError('حجم الملف كبير جدًا. الحد الأقصى 2 ميغابايت.');
          return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, image: result }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.image) {
      setError('يرجى ملء الحقول المطلوبة: الاسم، النوع، والصورة.');
      return;
    }
    if (formData.price <= 0) {
      setError('يرجى إدخال سعر صحيح. يجب أن يكون السعر أكبر من صفر.');
      return;
    }
    setError('');

    if (isEditMode) {
        onUpdateHatItem(formData as Item);
    } else {
        onAddItem(formData);
    }
  };
  
  const handleSidebarSelect = (field: keyof Omit<Item, 'id'>, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  return (
    <div className="mt-6 border-t border-zinc-700 pt-6">
      <div className="flex flex-col-reverse md:flex-row gap-8">
        
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="flex-grow space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Inputs */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300">اسم الصنف</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputStyles}/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-zinc-300">الموديل</label>
                    <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} className={inputStyles}/>
                  </div>
                  <div>
                    <label htmlFor="barcode" className="block text-sm font-medium text-zinc-300">الباركود</label>
                    <input type="text" name="barcode" id="barcode" value={formData.barcode} onChange={handleChange} className={inputStyles}/>
                  </div>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-zinc-300">النوع</label>
                <select name="type" id="type" value={formData.type} onChange={handleChange} required className={inputStyles}>
                   {uniqueData.types.length === 0 ? (
                     <option value="" disabled>أضف نوعًا من قائمة الإدخال السريع</option>
                   ) : (
                     uniqueData.types.map(type => <option key={type} value={type}>{type}</option>)
                   )}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-zinc-300">الفئة</label>
                    <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} className={inputStyles}/>
                  </div>
                  <div>
                    <label htmlFor="size" className="block text-sm font-medium text-zinc-300">المقاس</label>
                    <input type="text" name="size" id="size" value={formData.size} onChange={handleChange} className={inputStyles}/>
                  </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="color" className="block text-sm font-medium text-zinc-300">اللون</label>
                  <input type="text" name="color" id="color" value={formData.color} onChange={handleChange} className={inputStyles}/>
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-zinc-300">السعر التقريبي (SAR)</label>
                  <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" className={inputStyles}/>
                </div>
              </div>
              <div>
                <label htmlFor="material" className="block text-sm font-medium text-zinc-300">المادة</label>
                <input type="text" name="material" id="material" value={formData.material} onChange={handleChange} className={inputStyles}/>
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-zinc-300">بلد المنشأ</label>
                <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} className={inputStyles}/>
              </div>
            </div>
            {/* Right Column: Image Upload and Description */}
            <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-zinc-300">صورة الصنف</label>
                  <div className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-zinc-600 border-dashed rounded-md h-48 bg-zinc-700/20">
                      <div className="space-y-1 text-center">
                          {imagePreview ? (
                              <img src={imagePreview} alt="Preview" className="mx-auto max-h-24 max-w-24 object-contain"/>
                          ) : (
                              <UploadIcon />
                          )}
                          <div className="flex text-sm text-zinc-400">
                              <label htmlFor="file-upload" className="relative cursor-pointer bg-zinc-700 rounded-md font-medium text-amber-400 hover:text-amber-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-zinc-800 focus-within:ring-amber-500 px-1">
                                  <span>ارفع ملفًا</span>
                                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                              </label>
                              <p className="pr-1">أو اسحب وأفلت</p>
                          </div>
                          <p className="text-xs text-zinc-500">PNG, JPG, WEBP بحجم يصل إلى 2 ميغابايت</p>
                      </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-zinc-300">وصف مختصر</label>
                  <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={5} className={inputStyles}></textarea>
                </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-2 text-center bg-red-900/50 border border-red-500/50 py-2 px-4 rounded-md">{error}</p>}
          <div className="flex justify-end gap-4 pt-4 border-t border-zinc-700 mt-4">
            <button type="button" onClick={onCancel} className="bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg hover:bg-zinc-500 transition-colors">
                إلغاء
            </button>
            <button type="submit" className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-500 transition-colors shadow-md shadow-amber-900/50">
                {isEditMode ? 'حفظ التعديلات' : 'إضافة الصنف'}
            </button>
          </div>
        </form>
        
        {/* Sidebar Section */}
        <FormSidebar 
          uniqueData={uniqueData} 
          onItemSelect={handleSidebarSelect}
          onAddItem={onAddQuickEntryItem}
          // FIX: Pass the `onUpdateQuickEntryItem` function to FormSidebar's `onUpdateItem` prop.
          onUpdateItem={onUpdateQuickEntryItem}
          onDeleteItem={onDeleteItem}
          permissions={permissions}
        />

      </div>
    </div>
  );
};

export default HatForm;