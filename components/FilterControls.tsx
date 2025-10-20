import React from 'react';
import type { Filters, ItemType } from '../types';

interface FilterControlsProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  countries: string[];
  types: ItemType[];
  colors: string[];
  materials: string[];
  categories: string[];
  sizes: string[];
}

const FilterControls: React.FC<FilterControlsProps> = ({ filters, setFilters, countries, types, colors, materials, categories, sizes }) => {
    const inputStyles = "w-full rounded-lg border-zinc-600 bg-zinc-700/80 text-white shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-base transition-colors duration-200 placeholder:text-zinc-400 px-4 py-2.5";
    
    const handleInputChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({ searchTerm: '', type: 'الكل', country: '', barcode: '', category: '', size: '', color: '', material: '' });
    };

    return (
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 p-6 rounded-xl shadow-lg mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-4 items-center">
                <div className="sm:col-span-2 lg:col-span-2">
                    <label htmlFor="search" className="sr-only">بحث</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="ابحث بالاسم أو الموديل..."
                        value={filters.searchTerm}
                        onChange={(e) => handleInputChange('searchTerm', e.target.value)}
                        className={inputStyles}
                    />
                </div>
                <div>
                    <label htmlFor="barcode" className="sr-only">بحث بالباركود</label>
                    <input
                        type="text"
                        id="barcode"
                        placeholder="ابحث بالباركود..."
                        value={filters.barcode}
                        onChange={(e) => handleInputChange('barcode', e.target.value)}
                        className={inputStyles}
                    />
                </div>
                <div>
                    <label htmlFor="type-filter" className="sr-only">النوع</label>
                    <select
                        id="type-filter"
                        value={filters.type}
                        onChange={(e) => handleInputChange('type', e.target.value as ItemType | 'الكل')}
                        className={inputStyles}
                    >
                        <option value="الكل">كل الأنواع</option>
                        {types.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="category-filter" className="sr-only">الفئة</label>
                    <select
                        id="category-filter"
                        value={filters.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className={inputStyles}
                    >
                        <option value="">كل الفئات</option>
                        {categories.map(category => <option key={category} value={category}>{category}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="size-filter" className="sr-only">المقاس</label>
                    <select
                        id="size-filter"
                        value={filters.size}
                        onChange={(e) => handleInputChange('size', e.target.value)}
                        className={inputStyles}
                    >
                        <option value="">كل المقاسات</option>
                        {sizes.map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="country-filter" className="sr-only">البلد</label>
                    <select
                        id="country-filter"
                        value={filters.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className={inputStyles}
                    >
                        <option value="">كل البلدان</option>
                        {countries.map(country => <option key={country} value={country}>{country}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="color-filter" className="sr-only">اللون</label>
                    <select
                        id="color-filter"
                        value={filters.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className={inputStyles}
                    >
                        <option value="">كل الألوان</option>
                        {colors.map(color => <option key={color} value={color}>{color}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="material-filter" className="sr-only">المادة</label>
                    <select
                        id="material-filter"
                        value={filters.material}
                        onChange={(e) => handleInputChange('material', e.target.value)}
                        className={inputStyles}
                    >
                        <option value="">كل المواد</option>
                        {materials.map(material => <option key={material} value={material}>{material}</option>)}
                    </select>
                </div>
                <div>
                     <button onClick={resetFilters} className="w-full bg-zinc-600 text-zinc-200 px-4 py-2.5 rounded-md hover:bg-zinc-500 transition-colors text-base">
                        إعادة تعيين
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterControls;