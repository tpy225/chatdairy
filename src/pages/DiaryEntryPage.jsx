import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDiary } from '../context/DiaryContext';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import DiaryItem from '../components/diary/DiaryItem';

export default function DiaryEntryPage() {
  const { date, id } = useParams();
  const navigate = useNavigate();
  const { getDiariesByDate, getDiaryById } = useDiary();
  const scrollContainerRef = React.useRef(null);
  
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [date, id]);
  
  let diariesToDisplay = [];
  let displayDate = date;

  if (id) {
    const diary = getDiaryById(id);
    if (diary) {
      diariesToDisplay = [diary];
      displayDate = diary.date;
    }
  } else if (date) {
    diariesToDisplay = getDiariesByDate(date);
  }

  if (!diariesToDisplay || diariesToDisplay.length === 0) {
    const fallbackDate = displayDate || format(new Date(), 'yyyy-MM-dd');
    
    return (
      <div className="h-full flex flex-col items-center justify-center text-cream-900/40 space-y-4">
        <p>No entries found for {displayDate ? format(parseISO(displayDate), 'MMMM do, yyyy') : 'this selection'}</p>
        <button 
          onClick={() => navigate(`/write?date=${fallbackDate}`)}
          className="px-6 py-2 bg-cream-900 text-white rounded-xl shadow-md hover:bg-cream-800 transition-colors flex items-center gap-2"
        >
          <PenTool size={16} />
          Write for this day
        </button>
        <button 
          onClick={() => navigate('/calendar')}
          className="text-sm hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl w-full mx-auto h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex-none p-6 pb-2 flex items-center justify-between bg-diary-bg z-10">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/calendar')}
            className="p-2 hover:bg-white rounded-full transition-colors text-cream-900/60 hover:text-cream-900"
            title="Back to Timeline"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-sm font-medium text-cream-900/40 uppercase tracking-widest">
            {displayDate && format(parseISO(displayDate), 'EEEE, MMMM do, yyyy')}
          </span>
          {diariesToDisplay.length > 0 && (
             <span className="text-xs px-2 py-0.5 bg-cream-100 text-cream-600 rounded-full font-bold">
               {diariesToDisplay.length} {diariesToDisplay.length === 1 ? 'Entry' : 'Entries'}
             </span>
          )}
        </div>
        
        {/* Add New Button */}
        <button 
            onClick={() => navigate(`/write?date=${displayDate}`)}
            className="p-2 text-cream-900/60 hover:text-cream-900 hover:bg-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
            title="Add another entry"
        >
            <PenTool size={18} />
            <span className="hidden sm:inline">Add New</span>
        </button>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2 space-y-8"
      >
        {diariesToDisplay.map(diary => (
            <DiaryItem key={diary.id} diary={diary} />
        ))}
      </div>
    </motion.div>
  );
}
