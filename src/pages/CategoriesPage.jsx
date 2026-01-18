import React from 'react';
import { Book, Heart, Star, Coffee, Briefcase, Plane } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLayout } from '../components/layout/LayoutContext';

const CATEGORIES = [
  { id: 1, name: 'Daily Life', icon: Coffee, color: 'bg-orange-100 text-orange-600' },
  { id: 2, name: 'Work', icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
  { id: 3, name: 'Travel', icon: Plane, color: 'bg-green-100 text-green-600' },
  { id: 4, name: 'Emotions', icon: Heart, color: 'bg-rose-100 text-rose-600' },
  { id: 5, name: 'Dreams', icon: Star, color: 'bg-purple-100 text-purple-600' },
  { id: 6, name: 'Reading', icon: Book, color: 'bg-amber-100 text-amber-600' },
];

export default function CategoriesPage() {
  const { isSidebarCollapsed } = useLayout(); // Assume useLayout is available or implement responsive check

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold text-cream-900 mb-6 flex items-center gap-2">
        <Book className="text-cream-900" />
        Bookshelf
      </h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 overflow-y-auto pb-4 pr-2 custom-scrollbar">
        {CATEGORIES.map((cat) => (
          <div 
            key={cat.id} 
            className="group cursor-pointer flex flex-col items-center gap-3"
          >
            {/* Book Cover */}
            <div className={cn(
              "relative w-full aspect-[3/4] rounded-r-2xl rounded-l-md shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl",
              "bg-white border-l-8 border-cream-200 overflow-hidden",
              "flex flex-col items-center justify-center p-4 text-center",
              "md:aspect-[2/3] md:w-24 lg:w-28" // Smaller on desktop
            )}>
              <div className={cn("p-4 rounded-full mb-2", cat.color)}>
                <cat.icon size={24} />
              </div>
              <h3 className="font-serif font-bold text-cream-900 text-sm md:text-base line-clamp-2">
                {cat.name}
              </h3>
              
              {/* Decorative Lines */}
              <div className="absolute right-2 top-0 bottom-0 w-[1px] bg-cream-100/50" />
              <div className="absolute right-3 top-0 bottom-0 w-[1px] bg-cream-100/50" />
            </div>
            
            {/* Shadow/Shelf effect */}
            <div className="w-[80%] h-2 bg-black/5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
