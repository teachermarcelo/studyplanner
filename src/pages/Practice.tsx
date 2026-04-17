
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Layers, Star, Play, Timer, CheckCircle, XCircle, RotateCcw, Plus } from 'lucide-react';
import { Flashcard } from '../types';
import { cn } from '../lib/utils';

export default function Practice() {
  const { user } = useAuth();
  const [view, setView] = useState<'menu' | 'flashcards' | 'quiz'>('menu');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (view === 'flashcards' && user) {
      fetchFlashcards();
    }
  }, [view, user]);

  const fetchFlashcards = async () => {
    const { data } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', user?.id)
      .order('next_review', { ascending: true });
    if (data) setFlashcards(data);
  };

  const addFlashcard = async () => {
    if (!newCard.front || !newCard.back || !user) return;
    const { error } = await supabase.from('flashcards').insert([
      { ...newCard, user_id: user.id }
    ]);
    if (!error) {
      setNewCard({ front: '', back: '' });
      setShowAddModal(false);
      fetchFlashcards();
    }
  };

  const handleRate = async (difficulty: 'easy' | 'medium' | 'hard') => {
    // Basic SRS logic simulation
    setCurrentIndex(prev => prev + 1);
    setFlipped(false);
  };

  if (view === 'flashcards') {
    const card = flashcards[currentIndex];

    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
        <header className="flex items-center justify-between">
          <button onClick={() => setView('menu')} className="text-zinc-500 font-bold hover:text-indigo-600 transition-colors">
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <Layers className="text-indigo-600" size={20} />
            <span className="font-bold">{currentIndex + 1} / {flashcards.length}</span>
          </div>
          <button onClick={() => setShowAddModal(true)} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors">
            <Plus size={20} />
          </button>
        </header>

        {flashcards.length > 0 ? (
          currentIndex < flashcards.length ? (
            <div className="perspective-1000">
              <motion.div 
                onClick={() => setFlipped(!flipped)}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="relative w-full aspect-[4/3] cursor-pointer preserve-3d"
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden glass-card p-12 flex flex-col items-center justify-center text-center shadow-xl">
                  <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-4">Front</span>
                  <h2 className="text-4xl font-bold">{card.front}</h2>
                  <p className="mt-8 text-zinc-400 text-sm">Click to flip</p>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden glass-card p-12 flex flex-col items-center justify-center text-center shadow-xl [transform:rotateY(180deg)] bg-indigo-600 text-white border-none">
                  <span className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Back</span>
                  <h2 className="text-4xl font-bold">{card.back}</h2>
                  <p className="mt-8 text-white/50 text-sm">How was it?</p>
                </div>
              </motion.div>

              <AnimatePresence>
                {flipped && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-3 gap-4 mt-8"
                  >
                    <button onClick={() => handleRate('hard')} className="bg-red-100 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-200 transition-colors">Hard</button>
                    <button onClick={() => handleRate('medium')} className="bg-zinc-100 text-zinc-600 py-4 rounded-2xl font-bold hover:bg-zinc-200 transition-colors">Good</button>
                    <button onClick={() => handleRate('easy')} className="bg-green-100 text-green-600 py-4 rounded-2xl font-bold hover:bg-green-200 transition-colors">Easy</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="glass-card p-12 text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold">Session Complete!</h2>
              <p className="text-zinc-500">You've reviewed all your pending cards. Good job!</p>
              <button onClick={() => setView('menu')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200">
                Finish
              </button>
            </div>
          )
        ) : (
          <div className="glass-card p-12 text-center space-y-6">
             <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mx-auto">
                <Layers size={32} />
              </div>
              <h2 className="text-2xl font-bold">No Cards Yet</h2>
              <p className="text-zinc-500">Start adding vocabulary from your lessons to practice here.</p>
              <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">
                Add Your First Card
              </button>
          </div>
        )}

        {/* Add Modal Placeholder */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-3xl p-8 w-full max-w-md space-y-4">
                <h3 className="text-xl font-bold">New Flashcard</h3>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Front (English)" 
                    className="w-full p-4 bg-zinc-100 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-600"
                    value={newCard.front}
                    onChange={e => setNewCard({...newCard, front: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder="Back (Translation/Meaning)" 
                    className="w-full p-4 bg-zinc-100 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-600"
                    value={newCard.back}
                    onChange={e => setNewCard({...newCard, back: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                   <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 font-bold text-zinc-500 hover:bg-zinc-50 rounded-xl transition-colors">Cancel</button>
                   <button onClick={addFlashcard} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Save</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center">
        <h1 className="text-4xl font-black mb-2 tracking-tight">Practice Lab</h1>
        <p className="text-zinc-500 font-medium">Strengthen your memory and perfect your skills.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          whileHover={{ y: -5 }}
          onClick={() => setView('flashcards')}
          className="glass-card p-8 cursor-pointer group space-y-6"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
             <Layers size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Smart Flashcards</h3>
            <p className="text-zinc-500">Spaced repetition system to help you memorize vocabulary forever.</p>
          </div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold">
            Practice now <ArrowRight size={18} className="" />
          </div >
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="glass-card p-8 opacity-60 grayscale cursor-not-allowed group space-y-6"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
             <Timer size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Speed Quiz</h3>
            <p className="text-zinc-500">Challenge yourself under pressure. Coming soon to all levels!</p>
          </div>
          <div className="flex items-center gap-2 text-orange-600 font-bold">
            Locked <Lock size={18} className="" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ArrowRight({ size, className }: { size: number, className: string }) {
  return <Play size={size} className={cn("fill-current", className)} />;
}

function Lock({ size, className }: { size: number, className: string }) {
  return <XCircle size={size} className={className} />;
}
