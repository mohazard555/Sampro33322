import React from 'react';
import type { Item } from '../types';
import HatCard from './HatCard';

interface HatGridProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
}

const HatGrid: React.FC<HatGridProps> = ({ items, onSelectItem }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-slate-400">لم يتم العثور على أصناف تطابق بحثك.</p>
        <p className="text-slate-500 mt-2">حاول تعديل فلاتر البحث.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
      {items.map(item => (
        <HatCard key={item.id} item={item} onSelectItem={onSelectItem} />
      ))}
    </div>
  );
};

export default HatGrid;