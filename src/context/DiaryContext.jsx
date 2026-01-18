import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';

const DiaryContext = createContext({
  diaries: [],
  getDiaryByDate: (date) => {},
  addDiary: (diary) => {},
});

const MOCK_DIARIES = [
  {
    id: '1',
    date: format(new Date(), 'yyyy-MM-dd'),
    title: 'Start of a new journey',
    content: 'Today I decided to start keeping a diary with this AI app. The interface is so calming and beautiful.',
    mood: 'happy',
    comments: [
      { id: 'c1', author: 'ai', text: 'I am so glad you like it! Let us make many memories together.', date: new Date().toISOString() }
    ]
  },
  {
    id: '2',
    date: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'), // Yesterday
    title: 'A quiet afternoon',
    content: 'Spent the afternoon reading in a coffee shop. The smell of roasted beans was everywhere.',
    mood: 'calm',
    comments: []
  },
  {
    id: '3',
    date: format(new Date(Date.now() - 86400000 * 3), 'yyyy-MM-dd'), // 3 days ago
    title: 'Rainy mood',
    content: 'It rained all day. Perfect weather for coding and listening to lo-fi beats.',
    mood: 'melancholic',
    comments: []
  }
];

export function DiaryProvider({ children }) {
  const [diaries, setDiaries] = useState(() => {
    try {
      const saved = localStorage.getItem('chatdairy-entries');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : MOCK_DIARIES;
    } catch (e) {
      console.error("Failed to parse chatdairy-entries:", e);
      return MOCK_DIARIES;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('chatdairy-entries', JSON.stringify(diaries));
    } catch (error) {
      console.error("Failed to save diaries to localStorage:", error);
      if (error.name === 'QuotaExceededError') {
        alert("Storage is full! Failed to save diary. Please clear some data.");
      }
    }
  }, [diaries]);

  const getDiaryByDate = (dateString) => {
    return diaries.find(d => d.date === dateString);
  };

  const getDiariesByDate = (dateString) => {
    return diaries.filter(d => d.date === dateString);
  };

  const getDiaryById = (id) => {
    return diaries.find(d => d.id === id);
  };

  const addDiary = (newDiary) => {
    setDiaries(prev => {
      // Just append the new diary, allowing multiple per day
      // Ensure comments array exists
      const updatedDiaries = [...prev, { 
        ...newDiary, 
        createdAt: newDiary.createdAt || new Date().toISOString(),
        comments: newDiary.comments || [],
        chatHistory: newDiary.chatHistory || [] 
      }];
      return updatedDiaries;
    });
  };

  const updateDiary = (id, updates) => {
    setDiaries(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDiary = (id) => {
    setDiaries(prev => prev.filter(d => d.id !== id));
  };

  const deleteChatHistory = (id) => {
    setDiaries(prev => prev.map(d => {
      if (d.id === id) {
        const { chatHistory, ...rest } = d;
        return rest;
      }
      return d;
    }));
  };

  const addComment = (id, comment) => {
    setDiaries(prev => prev.map(d => {
      if (d.id === id) {
        const comments = d.comments || [];
        return { ...d, comments: [...comments, { ...comment, id: Date.now().toString(), date: new Date().toISOString() }] };
      }
      return d;
    }));
  };

  const deleteComment = (diaryId, commentId) => {
    setDiaries(prev => prev.map(d => {
      if (d.id === diaryId && d.comments) {
        return {
          ...d,
          comments: d.comments.filter(c => c.id !== commentId)
        };
      }
      return d;
    }));
  };

  return (
    <DiaryContext.Provider value={{ diaries, getDiaryByDate, getDiariesByDate, getDiaryById, addDiary, updateDiary, deleteDiary, deleteChatHistory, addComment, deleteComment }}>
      {children}
    </DiaryContext.Provider>
  );
}

export const useDiary = () => useContext(DiaryContext);
