import React from 'react';
import type { Item } from '../types';
import { CloseIcon, PrintIcon, EditIcon } from './Icons';

interface HatDetailModalProps {
  item: Item;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (item: Item) => void;
  canDelete: boolean;
  canEdit: boolean;
}

const HatDetailModal: React.FC<HatDetailModalProps> = ({ item, onClose, onDelete, onEdit, canDelete, canEdit }) => {
    
  const handleDelete = () => {
    if (window.confirm(`هل أنت متأكد من أنك تريد حذف صنف "${item.name}"؟`)) {
        onDelete(item.id);
    }
  }

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 backdrop-blur-sm printable-modal"
        onClick={onClose}
    >
      <div 
        className="bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row printable-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full md:w-1/2 bg-zinc-900 flex items-center justify-center">
            <img src={item.image} alt={item.name} className="w-full h-64 md:h-full object-contain rounded-t-xl md:rounded-l-xl md:rounded-t-none"/>
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-8 relative flex flex-col">
            <button onClick={onClose} className="absolute top-4 left-4 text-zinc-400 hover:text-white transition-colors no-print">
                <CloseIcon />
            </button>
            <div className="flex-grow">
                <h2 className="text-3xl font-bold font-serif text-white mb-2">{item.name}</h2>
                <p className="text-xl text-amber-400 font-semibold mb-4">{item.price} SAR</p>
                
                <div className="space-y-3 text-zinc-300 text-base">
                    <p><span className="font-semibold text-zinc-100">الموديل:</span> {item.model || 'N/A'}</p>
                    <p><span className="font-semibold text-zinc-100">الباركود:</span> {item.barcode || 'N/A'}</p>
                    <p><span className="font-semibold text-zinc-100">النوع:</span> <span className="bg-zinc-700 text-amber-300 px-2 py-1 rounded text-sm">{item.type}</span></p>
                    <p><span className="font-semibold text-zinc-100">الفئة:</span> {item.category || 'N/A'}</p>
                    <p><span className="font-semibold text-zinc-100">المقاس:</span> {item.size || 'N/A'}</p>
                    <p><span className="font-semibold text-zinc-100">اللون:</span> {item.color}</p>
                    <p><span className="font-semibold text-zinc-100">المادة:</span> {item.material}</p>
                    <p><span className="font-semibold text-zinc-100">بلد المنشأ:</span> {item.country}</p>
                </div>

                <div className="mt-6 border-t border-zinc-700 pt-4">
                    <h4 className="font-semibold text-white text-lg">الوصف</h4>
                    <p className="text-zinc-400 mt-2 leading-relaxed text-base">{item.description}</p>
                </div>
            </div>
            <div className="mt-8 pt-4 border-t border-zinc-700 flex flex-col sm:flex-row gap-4 no-print">
                <button
                    onClick={() => window.print()}
                    className="w-full bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors duration-300 font-semibold text-base flex items-center justify-center gap-2"
                >
                    <PrintIcon />
                    طباعة
                </button>
                {canEdit && (
                    <button 
                        onClick={() => onEdit(item)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors duration-300 font-semibold text-base flex items-center justify-center gap-2"
                    >
                        <EditIcon className="h-5 w-5"/>
                        تعديل
                    </button>
                )}
                {canDelete && (
                    <button 
                        onClick={handleDelete}
                        className="w-full bg-red-600/90 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300 font-semibold text-base"
                    >
                        حذف الصنف
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HatDetailModal;