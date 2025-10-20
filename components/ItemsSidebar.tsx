import React from 'react';
import type { Item } from '../types';
import { CloseIcon, PrintIcon, ExportIcon } from './Icons';

interface ItemsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  onSelectItem: (item: Item) => void;
}

const ItemsSidebar: React.FC<ItemsSidebarProps> = ({ isOpen, onClose, items, onSelectItem }) => {

    const exportToCSV = () => {
        const headers = 'المعرّف,الاسم,الموديل,الباركود,النوع,الفئة,المقاس,اللون,المادة,بلد المنشأ,السعر,الوصف\n';
        const rows = items.map(item => 
            [
                item.id,
                `"${item.name.replace(/"/g, '""')}"`,
                `"${item.model.replace(/"/g, '""')}"`,
                `"${item.barcode}"`,
                item.type,
                `"${item.category.replace(/"/g, '""')}"`,
                item.size,
                item.color,
                `"${item.material.replace(/"/g, '""')}"`,
                item.country,
                item.price,
                `"${item.description.replace(/"/g, '""')}"`
            ].join(',')
        ).join('\n');

        const csvContent = headers + rows;
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'sam-pro-inventory.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintList = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('يرجى السماح بالنوافذ المنبثقة لطباعة القائمة.');
            return;
        }

        const tableRows = items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.model || ''}</td>
                <td>${item.type}</td>
                <td>${item.category || ''}</td>
                <td>${item.size || ''}</td>
                <td>${item.color || ''}</td>
                <td>${item.material || ''}</td>
                <td>${item.country || ''}</td>
                <td>${item.price} SAR</td>
                <td>${item.barcode || ''}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>قائمة الأصناف</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; direction: rtl; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10pt; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; word-break: break-word; }
                        th { background-color: #f2f2f2; }
                        @page { size: A4 landscape; margin: 15mm; }
                        h1 { font-family: 'Playfair Display', serif; }
                    </style>
                </head>
                <body>
                    <h1>قائمة الأصناف</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>الاسم</th>
                                <th>الموديل</th>
                                <th>النوع</th>
                                <th>الفئة</th>
                                <th>المقاس</th>
                                <th>اللون</th>
                                <th>المادة</th>
                                <th>بلد المنشأ</th>
                                <th>السعر</th>
                                <th>الباركود</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 250);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };


  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside className={`fixed top-0 right-0 h-full w-full max-w-md bg-zinc-800 border-l border-zinc-700 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-700 bg-zinc-900/50">
            <h3 className="text-xl font-serif text-white">قائمة الأصناف (${items.length})</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                <CloseIcon />
            </button>
        </div>
        
        <div className="p-4 flex items-center gap-4 border-b border-zinc-700">
            <button onClick={handlePrintList} className="flex-1 flex items-center justify-center gap-2 bg-sky-600 text-white px-3 py-2 rounded-lg hover:bg-sky-500 transition-colors text-sm">
                <PrintIcon />
                طباعة القائمة
            </button>
            <button onClick={exportToCSV} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-500 transition-colors text-sm">
                <ExportIcon />
                تصدير إلى CSV
            </button>
        </div>

        <div className="flex-grow overflow-y-auto">
            {items.length === 0 ? (
                <p className="text-zinc-400 text-center p-8">لا توجد أصناف محفوظة لعرضها.</p>
            ) : (
                <ul className="divide-y divide-zinc-700">
                    {items.map(item => (
                        <li key={item.id}>
                            <button onClick={() => onSelectItem(item)} className="w-full flex items-center gap-4 p-4 text-right hover:bg-zinc-700/50 transition-colors">
                                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover flex-shrink-0 bg-zinc-700" />
                                <div className="flex-grow overflow-hidden">
                                    <h4 className="font-semibold text-white truncate">{item.name}</h4>
                                    <p className="text-sm text-zinc-400 truncate">الموديل: {item.model || 'N/A'}</p>
                                    <p className="text-sm text-amber-400 font-medium">{item.price} SAR</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </aside>
    </>
  );
};

export default ItemsSidebar;