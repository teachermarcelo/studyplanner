
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Trophy, Medal, Star, ChevronUp, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

export default function Leaderboard() {
  const { profile: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(20);
      
      if (data) setUsers(data);
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  const topThree = users.slice(0, 3);
  const remaining = users.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <header className="text-center space-y-4">
        <div className="inline-flex p-3 bg-yellow-100 rounded-2xl text-yellow-600 mb-2">
          <Trophy size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight">Community Ranking</h1>
        <p className="text-zinc-500 font-medium">Competition breeds excellence. Who is the most fluent?</p>
      </header>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-4 items-end max-w-2xl mx-auto pt-8">
        {/* 2nd Place */}
        {topThree[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-zinc-200 border-4 border-zinc-100 flex items-center justify-center font-bold text-xl mb-2 overflow-hidden">
                {topThree[1].avatar_url ? <img src={topThree[1].avatar_url} referrerPolicy="no-referrer" /> : topThree[1].full_name?.charAt(0)}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-zinc-300 flex items-center justify-center text-white border-2 border-white">
                2
              </div>
            </div>
            <p className="font-bold text-sm text-center truncate w-full">{topThree[1].full_name}</p>
            <p className="text-xs text-zinc-500 mb-4">{topThree[1].xp} XP</p>
            <div className="w-full h-24 bg-zinc-200 rounded-t-2xl flex items-end justify-center pb-2">
               <Medal className="text-zinc-400" size={24} />
            </div>
          </motion.div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex flex-col items-center -mt-8"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-yellow-400 border-4 border-yellow-200 flex items-center justify-center font-bold text-3xl mb-2 overflow-hidden">
                {topThree[0].avatar_url ? <img src={topThree[0].avatar_url} referrerPolicy="no-referrer" /> : topThree[0].full_name?.charAt(0)}
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white border-4 border-white">
                1
              </div>
            </div>
            <p className="font-bold text-lg text-center truncate w-full">{topThree[0].full_name}</p>
            <p className="text-xs text-zinc-500 mb-4">{topThree[0].xp} XP</p>
            <div className="w-full h-36 bg-yellow-400 rounded-t-2xl flex items-end justify-center pb-4 shadow-xl shadow-yellow-200/50">
               <Trophy className="text-yellow-600" size={32} />
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-orange-100 border-4 border-orange-50 flex items-center justify-center font-bold text-xl mb-2 overflow-hidden">
                {topThree[2].avatar_url ? <img src={topThree[2].avatar_url} referrerPolicy="no-referrer" /> : topThree[2].full_name?.charAt(0)}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-white border-2 border-white text-sm">
                3
              </div>
            </div>
            <p className="font-bold text-sm text-center truncate w-full">{topThree[2].full_name}</p>
            <p className="text-xs text-zinc-500 mb-4">{topThree[2].xp} XP</p>
            <div className="w-full h-16 bg-orange-100 rounded-t-2xl flex items-end justify-center pb-2">
               <Star className="text-orange-400" size={24} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Rest of List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 bg-zinc-50 border-b border-zinc-100 grid grid-cols-12 gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
           <div className="col-span-1 text-center">#</div>
           <div className="col-span-8">User</div>
           <div className="col-span-1 text-center">Level</div>
           <div className="col-span-2 text-right">Points</div>
        </div>
        <div className="divide-y divide-zinc-100">
          {remaining.map((user, i) => (
            <motion.div 
              key={user.id}
              className={cn(
                "p-4 grid grid-cols-12 gap-4 items-center transition-colors",
                currentUser?.id === user.id ? "bg-indigo-50" : "hover:bg-zinc-50"
              )}
            >
              <div className="col-span-1 text-center font-bold text-zinc-400">{i + 4}</div>
              <div className="col-span-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold">
                   {user.full_name?.charAt(0)}
                </div>
                <span className="font-medium">{user.full_name} {currentUser?.id === user.id && "(You)"}</span>
              </div>
              <div className="col-span-1 text-center font-bold text-zinc-500 text-xs bg-zinc-100 px-2 py-1 rounded">
                {user.level}
              </div>
              <div className="col-span-2 text-right font-mono font-bold text-indigo-600">
                 {user.xp}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
