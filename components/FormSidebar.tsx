import React, { useState } from 'react';
import type { Item, UniqueData, UserPermissions } from '../types';
import { PlusIcon, EditIcon, DeleteIcon, SaveIcon, CancelIcon } from './Icons';

type QuickEntryCategory = keyof UniqueData;

interface FormSidebarProps {
  uniqueData: UniqueData;
  onItemSelect: (field: keyof Omit<Item, 'id'>, value: string | number) => void;
  onAddItem: (category: QuickEntryCategory, value: string) => void;
  onUpdateItem: (category: QuickEntryCategory, oldValue: string, newValue: string) => void;
  onDeleteItem: (category: QuickEntryCategory, value: string) => void;
  permissions: UserPermissions;
}

interface EditableSidebarSectionProps {
    title: string; 
    items: (string | number)[]; 
    fieldName: keyof Omit<Item, 'id'>;
    categoryName: QuickEntryCategory;
    onSelect: (field: keyof Omit<Item, 'id'>, value: string | number) => void; 
    onAdd: (category: QuickEntryCategory, value: string) => void;
    onUpdate: (category: QuickEntryCategory, oldValue: string, newValue: string) => void;
    onDelete: (category: QuickEntryCategory, value: string) => void;
    inputType?: 'text' | 'number';
    permissions: UserPermissions;
}

const EditableSidebarSection: React.FC<EditableSidebarSectionProps> = ({ 
    title, items, fieldName, categoryName, onSelect, onAdd, onUpdate, onDelete, inputType = 'text', permissions 
}) => {
    
    const [isAdding, setIsAdding] = useState(false);
    const [newItemValue, setNewItemValue] = useState('');
    const [editingItem, setEditingItem] = useState<{ original: string; current: string } | null>(null);

    const handleAdd = () => {
        if (!newItemValue.trim()) return;
        onAdd(categoryName, newItemValue);
        setNewItemValue('');
        setIsAdding(false);
    };

    const handleUpdate = () => {
        if (editingItem && editingItem.current.trim()) {
            onUpdate(categoryName, editingItem.original, editingItem.current);
            setEditingItem(null);
        }
    };
    
    const handleDelete = (item: string | number) => {
        if(window.confirm(`هل أنت متأكد من حذف "${item}" من قائمة الإدخال السريع؟`)) {
            onDelete(categoryName, String(item));
        }
    }

    const inputClasses = "w-full bg-zinc-600 text-white rounded px-2 py-1 text-sm focus:ring-amber-500 focus:border-amber-500";

    return (
        <div>
            <div className="flex justify-between items-center mb-2 border-b border-zinc-600 pb-1">
                <h4 className="text-sm font-semibold text-zinc-300">{title}</h4>
                {permissions.canAdd && (
                    <button onClick={() => setIsAdding(!isAdding)} className="text-zinc-400 hover:text-white">
                        <PlusIcon className="w-4 h-4"/>
                    </button>
                )}
            </div>
            <div className="max-h-32 overflow-y-auto pr-2 space-y-1">
                {isAdding && (
                    <div className="flex gap-2 p-1 bg-zinc-700/50 rounded">
                        <input
                            type={inputType}
                            value={newItemValue}
                            onChange={(e) => setNewItemValue(e.target.value)}
                            className={inputClasses}
                            placeholder={`إضافة ${title.slice(0, -1)} جديد...`}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                            min={inputType === 'number' ? '0' : undefined}
                        />
                        <button onClick={handleAdd} className="text-green-400 hover:text-white"><SaveIcon/></button>
                        <button onClick={() => setIsAdding(false)} className="text-red-400 hover:text-white"><CancelIcon/></button>
                    </div>
                )}
                {items.map(item => (
                    <div key={String(item)} className="group flex items-center justify-between hover:bg-zinc-700/50 rounded">
                        {editingItem?.original === String(item) ? (
                             <div className="flex-grow flex gap-2 p-1">
                                <input
                                    type={inputType}
                                    value={editingItem.current}
                                    onChange={(e) => setEditingItem({...editingItem, current: e.target.value})}
                                    className={inputClasses}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                    min={inputType === 'number' ? '0' : undefined}
                                />
                                <button onClick={handleUpdate} className="text-green-400 hover:text-white"><SaveIcon/></button>
                                <button onClick={() => setEditingItem(null)} className="text-red-400 hover:text-white"><CancelIcon/></button>
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onSelect(fieldName, item)}
                                    className="w-full text-right text-sm text-zinc-400 group-hover:text-amber-400 px-2 py-1 transition-colors"
                                >
                                    {String(item)}
                                </button>
                                <div className="hidden group-hover:flex items-center gap-2 pr-2">
                                     {permissions.canAdd && <button onClick={() => setEditingItem({ original: String(item), current: String(item) })} className="text-zinc-500 hover:text-yellow-400"><EditIcon/></button>}
                                     {permissions.canDelete && <button onClick={() => handleDelete(item)} className="text-zinc-500 hover:text-red-500"><DeleteIcon/></button>}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};


const FormSidebar: React.FC<FormSidebarProps> = ({ uniqueData, onItemSelect, onAddItem, onUpdateItem, onDeleteItem, permissions }) => {
  const commonProps = { onSelect: onItemSelect, onAdd: onAddItem, onUpdate: onUpdateItem, onDelete: onDeleteItem, permissions };

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 space-y-4 self-start">
        <h3 className="text-lg font-serif text-white">إدارة الإدخال السريع</h3>
        <EditableSidebarSection title="الموديلات" items={uniqueData.models} fieldName="model" categoryName="models" {...commonProps}/>
        <EditableSidebarSection title="الأنواع" items={uniqueData.types} fieldName="type" categoryName="types" {...commonProps}/>
        <EditableSidebarSection title="الفئات" items={uniqueData.categories} fieldName="category" categoryName="categories" {...commonProps}/>
        <EditableSidebarSection title="المقاسات" items={uniqueData.sizes} fieldName="size" categoryName="sizes" {...commonProps}/>
        <EditableSidebarSection title="الباركودات" items={uniqueData.barcodes} fieldName="barcode" categoryName="barcodes" {...commonProps}/>
        <EditableSidebarSection title="الألوان" items={uniqueData.colors} fieldName="color" categoryName="colors" {...commonProps}/>
        <EditableSidebarSection title="المواد" items={uniqueData.materials} fieldName="material" categoryName="materials" {...commonProps}/>
        <EditableSidebarSection title="بلدان المنشأ" items={uniqueData.countries} fieldName="country" categoryName="countries" {...commonProps}/>
        <EditableSidebarSection title="الأسعار" items={uniqueData.prices} fieldName="price" categoryName="prices" inputType="number" {...commonProps}/>
    </div>
  );
};

export default FormSidebar;