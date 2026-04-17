
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ai, MODELS } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Mic, MicOff, MessageSquare, Volume2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AIClinic() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      content: `Hello ${profile?.full_name?.split(' ')[0]}! I'm your AI English Coach. Ready to practice speaking or writing? Tell me what's on your mind, or say 'Start a lesson'!` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const chat = ai.chats.create({
        model: MODELS.flash,
        config: {
          systemInstruction: `You are a helpful and encouraging English Language Coach for a student at ${profile?.level} CEFR level. 
          Your goals:
          1. Practice conversational English.
          2. Gently correct grammar or vocabulary mistakes.
          3. Provide feedback on how to sound more natural.
          4. Keep explanations simple and aligned with ${profile?.level} level.
          5. Use a friendly, immersive tone.
          If the user sends a message in another language, respond in English but briefly acknowledge understanding.`,
        }
      });

      const response = await chat.sendMessage({
        message: userMsg,
      });

      setMessages(prev => [...prev, { role: 'model', content: response.text || "I'm sorry, I couldn't process that. Let's try again!" }]);
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { role: 'model', content: "Something went wrong with my connection. Please try again in a moment!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto space-y-4">
      <header className="flex items-center justify-between glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold">AI Language Coach</h2>
            <p className="text-xs text-green-500 font-medium">Online · {profile?.level} Practice</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <Volume2 size={20} />
          </button>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 px-2 py-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-zinc-200 text-zinc-600"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl shadow-sm",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-white border border-zinc-100 rounded-tl-none text-zinc-800"
              )}>
                <div className="prose prose-sm prose-zinc max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <div className="flex items-start gap-3 max-w-[85%] animate-pulse">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center">
              <Bot size={16} className="text-zinc-400" />
            </div>
            <div className="p-4 bg-zinc-100 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-2 flex items-center gap-2">
        <button className="p-3 text-zinc-400 hover:text-indigo-600 transition-colors">
          <Mic size={20} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          className="flex-1 bg-transparent border-none focus:ring-0 font-medium px-2 py-3"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold flex items-center gap-2 shrink-0 overflow-hidden"
        >
          <Send size={18} />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>
    </div>
  );
}
