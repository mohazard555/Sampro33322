import React from 'react';
import type { Item } from '../types';

interface HatCardProps {
  item: Item;
  onSelectItem: (item: Item) => void;
}

const HatCard: React.FC<HatCardProps> = ({ item, onSelectItem }) => {
  return (
    <div className="bg-zinc-800 rounded-xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out flex flex-col border border-zinc-700 hover:border-amber-500/50">
      <div className="relative h-56 w-full bg-zinc-900">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
        />
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold font-serif text-white truncate">{item.name}</h3>
          <p className="text-sm text-zinc-400">{item.type}</p>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xl font-semibold text-amber-400">{item.price} SAR</p>
          <button
            onClick={() => onSelectItem(item)}
            className="bg-zinc-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors duration-300"
          >
            عرض التفاصيل
          </button>
        </div>
      </div>
    </div>
  );
};

export default HatCard;