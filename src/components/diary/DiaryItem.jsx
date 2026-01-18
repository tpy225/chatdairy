import React, { useState, useEffect, useMemo } from 'react';
import { useDiary } from '../../context/DiaryContext';
import { useAI } from '../../context/AIContext';
import { format, parseISO } from 'date-fns';
import { PenTool, Save, X, MessageCircle, Send, Sparkles, User, Bot, Trash2, MessageSquare, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import ConfirmDialog from '../ui/ConfirmDialog';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { TagEditor } from '../ui/TagEditor';
import { CategorySelector } from '../ui/CategorySelector';
import { MoodSelector, moods } from '../ui/MoodSelector';

export default function DiaryItem({ diary }) {
  const { updateDiary, addComment, deleteDiary, deleteChatHistory, deleteComment, diaries } = useDiary();
  const { generateChatResponse, generateComment, currentPersona } = useAI();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(diary.title);
  const [editContent, setEditContent] = useState(diary.content);
  const [editCategory, setEditCategory] = useState(diary.category || '');
  const [editTags, setEditTags] = useState(diary.tags || []);
  const [editMood, setEditMood] = useState(diary.mood || 'neutral');
  const [tagInput, setTagInput] = useState('');
  
  const [newComment, setNewComment] = useState('');
  const [isGeneratingComment, setIsGeneratingComment] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCommentDeleteConfirm, setShowCommentDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);

  // ReactQuill Modules
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  // Calculate existing categories
  const existingCategories = useMemo(() => {
    return [...new Set(diaries.map(d => d.category).filter(Boolean))];
  }, [diaries]);

  // Sync state when diary prop changes (e.g. after update)
  useEffect(() => {
    setEditTitle(diary.title);
    setEditContent(diary.content);
    setEditCategory(diary.category || '');
    setEditTags(diary.tags || []);
    setEditMood(diary.mood || 'neutral');
  }, [diary]);

  const handleDeleteDiary = () => {
    deleteDiary(diary.id);
  };

  const handleSave = () => {
    updateDiary(diary.id, {
      title: editTitle,
      content: editContent,
      category: editCategory.trim(),
      tags: editTags,
      mood: editMood
    });
    setIsEditing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(diary.id, {
      author: 'user',
      text: newComment
    });
    setNewComment('');
  };

  const handleAIComment = async () => {
    setIsGeneratingComment(true);
    try {
      console.log("Generating comment for diary:", diary.id);
      const commentText = await generateComment(diary, diary.comments);
      
      addComment(diary.id, {
        author: 'ai',
        text: commentText
      });
    } catch (error) {
      console.error("Failed to generate comment:", error);
      alert(`Failed to generate comment: ${error.message}`);
    } finally {
      setIsGeneratingComment(false);
    }
  };

  const handleDeleteComment = () => {
    if (commentToDelete) {
      deleteComment(diary.id, commentToDelete);
      setCommentToDelete(null);
      setShowCommentDeleteConfirm(false);
    }
  };

  return (
    <div className="mb-12 border-b border-cream-200 pb-12 last:border-0 last:pb-0">
      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteDiary}
        title="Delete Diary Entry"
        message="Are you sure you want to delete this diary entry? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />

      <ConfirmDialog 
        isOpen={showCommentDeleteConfirm}
        onClose={() => setShowCommentDeleteConfirm(false)}
        onConfirm={handleDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        isDangerous={true}
      />

      {/* Item Header / Controls */}
      <div className="mb-6 flex items-center justify-end">
        {!isEditing ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-cream-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Delete Diary"
            >
              <Trash2 size={18} />
            </button>
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 text-cream-900/60 hover:text-cream-900 hover:bg-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Pencil size={18} />
              Edit
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2 text-cream-900/60 hover:text-cream-900 hover:bg-cream-100 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-cream-900 text-white rounded-lg shadow-sm hover:bg-cream-800 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        )}
      </div>

      {/* Diary Content */}
      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-cream-100 mb-6 relative group min-h-[400px]">
        {isEditing ? (
          <div className="h-full flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-3xl md:text-4xl font-bold text-cream-900 border-b border-cream-100 pb-2 focus:border-cream-300 outline-none bg-transparent flex-1 min-w-[200px]"
                  placeholder="Title"
                />
                <MoodSelector value={editMood} onChange={setEditMood} />
            </div>
            
            {/* Metadata Edit Inputs */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-cream-500 mb-1 uppercase tracking-wide">Category</label>
                <CategorySelector 
                   value={editCategory} 
                   onChange={setEditCategory} 
                   existingCategories={existingCategories}
                />
              </div>
              <div className="flex-[2]">
                <label className="block text-xs font-medium text-cream-500 mb-1 uppercase tracking-wide">Tags</label>
                <TagEditor 
                  tags={editTags} 
                  setTags={setEditTags} 
                  inputValue={tagInput} 
                  setInputValue={setTagInput} 
                />
              </div>
            </div>

            <div className="flex-1">
              <ReactQuill 
                theme="snow" 
                value={editContent} 
                onChange={setEditContent} 
                modules={modules}
                placeholder="Write your diary content..."
                className="h-full"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
               {diary.mood && (() => {
                  const moodObj = moods.find(m => m.id === diary.mood);
                  if (moodObj) {
                    const Icon = moodObj.icon;
                    return <Icon size={32} className={moodObj.color} title={diary.mood} />;
                  }
                  return null;
               })()}
               <h1 className="text-3xl md:text-4xl font-bold text-cream-900 leading-tight">
                 {diary.title}
               </h1>
            </div>
            
            {/* Metadata: Tags and Category */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
                {diary.category && (
                    <span className="px-3 py-1 bg-cream-100 text-cream-600 rounded-full text-xs font-medium uppercase tracking-wide">
                        {diary.category}
                    </span>
                )}
                {diary.tags && diary.tags.length > 0 && diary.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-cream-50 text-cream-500 rounded-full text-xs border border-cream-100">
                        #{tag}
                    </span>
                ))}
            </div>

            <div 
              className="prose prose-stone max-w-none text-cream-900/80 leading-loose text-lg font-serif"
              dangerouslySetInnerHTML={{ __html: diary.content }}
            />
          </>
        )}
      </div>

      {/* Chat History Section */}
      {diary.chatHistory && diary.chatHistory.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-cream-100 mb-6 shadow-sm">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsChatHistoryOpen(!isChatHistoryOpen)}
          >
            <h3 className="text-lg font-bold text-cream-900 flex items-center gap-2">
              <MessageSquare size={20} />
              Chat History
              <span className="text-xs font-normal text-cream-500 ml-2 bg-cream-100 px-2 py-0.5 rounded-full">
                {diary.chatHistory.length} messages
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete the chat history? This cannot be undone.')) {
                    deleteChatHistory(diary.id);
                  }
                }}
                className="p-2 hover:bg-red-50 text-cream-400 hover:text-red-500 rounded-lg transition-colors"
                title="Delete Chat History"
              >
                <Trash2 size={18} />
              </button>
              {isChatHistoryOpen ? <ChevronUp size={20} className="text-cream-400" /> : <ChevronDown size={20} className="text-cream-400" />}
            </div>
          </div>
          
          <AnimatePresence>
            {isChatHistoryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar p-2 mt-4 bg-cream-50/30 rounded-xl border border-cream-100/50">
                  {diary.chatHistory.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "flex gap-3",
                        msg.sender === 'user' ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shrink-0 shadow-sm",
                        msg.sender === 'user' ? "bg-cream-900" : "bg-amber-500"
                      )}>
                        {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>
                      <div className={cn(
                        "p-3 rounded-xl max-w-[80%] text-sm leading-relaxed shadow-sm",
                        msg.sender === 'user' 
                          ? "bg-white text-cream-900 border border-cream-100 rounded-tr-none" 
                          : "bg-white text-cream-900 border border-cream-100 rounded-tl-none"
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-cream-50/50 rounded-2xl p-6 border border-cream-100 flex flex-col">
        <h3 className="text-lg font-bold text-cream-900 mb-4 flex items-center gap-2">
          <MessageCircle size={20} />
          Comments
        </h3>
        
        <div className="space-y-4 mb-4">
          {diary.comments && diary.comments.length > 0 ? (
            diary.comments.map((comment) => (
              <div 
                key={comment.id} 
                className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed max-w-[90%]",
                  comment.author === 'ai' 
                    ? "bg-white border border-cream-100 ml-0 mr-auto rounded-tl-none shadow-sm" 
                    : "bg-cream-200/50 ml-auto mr-0 rounded-tr-none"
                )}
              >
                <div className="flex items-center gap-2 mb-1 justify-between">
                  <div className="flex items-center gap-2">
                    {comment.author === 'ai' ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Bot size={12} />
                        AI ({currentPersona.name})
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-bold text-cream-700">
                        <User size={12} />
                        You
                      </div>
                    )}
                    <span className="text-[10px] text-cream-400">
                      {format(parseISO(comment.date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setCommentToDelete(comment.id);
                      setShowCommentDeleteConfirm(true);
                    }}
                    className="text-cream-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                    title="Delete Comment"
                  >
                    <X size={12} />
                  </button>
                </div>
                <p className="text-cream-900/90">{comment.text}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-cream-900/30 py-8 text-sm italic">
              No comments yet. Why not ask AI for some thoughts?
            </div>
          )}
        </div>

        <div className="flex gap-2 items-end mt-auto">
          <button 
            onClick={handleAIComment}
            disabled={isGeneratingComment}
            className="p-3 bg-white border border-cream-200 text-amber-500 rounded-xl hover:bg-cream-50 transition-colors shadow-sm disabled:opacity-50 shrink-0"
            title="Ask AI for comment"
          >
            {isGeneratingComment ? (
              <div className="animate-spin w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full" />
            ) : (
              <Sparkles size={20} />
            )}
          </button>
          
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              placeholder="Add a comment..." 
              className="w-full pl-4 pr-12 py-3 bg-white border border-cream-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cream-200 shadow-sm"
            />
            <button 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cream-900 text-white rounded-lg hover:bg-cream-800 transition-colors disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}