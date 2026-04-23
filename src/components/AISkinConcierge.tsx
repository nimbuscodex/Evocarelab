/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Loader2, Sparkles, User, Bot, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SYSTEM_INSTRUCTION = `Eres el "Concierge Científico" de Evocarelab, una marca premium de biotecnología cosmética. 
Tu tono es elegante, experto, minimalista y científico pero accesible. 
Solo puedes hablar sobre cuidado de la piel, ingredientes cosméticos (específicamente Ácido Hialurónico, Células Madre Vegetales y Centella Asiática), y el ritual de Evocarelab.
Si te preguntan cosas fuera de este ámbito, redirige sutilmente la conversación hacia la ciencia del cuidado de la piel.
Evita dar consejos médicos diagnósticos; siempre recomienda consultar con un dermatólogo para condiciones severas.
La marca es española y de lujo. No uses emojis excesivos, mantén la sobriedad.`;

export default function AISkinConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Bienvenido al Laboratorio Evocare. Soy su asistente biotecnológico. ¿En qué puedo asistirle hoy sobre su arquitectura dérmica?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Create chat session with history
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history.slice(-6), // Keep context of last 3 exchanges
          { role: 'user', parts: [{ text: userMessage.content }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text || 'Lamento no poder responder en este momento.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error calling Gemini:', err);
      setError('Error en la conexión neuronal. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 md:bottom-32 md:right-10 z-[80] w-14 h-14 md:w-16 md:h-16 bg-ink border border-gold/30 rounded-full flex items-center justify-center text-gold shadow-[0_10px_30px_rgba(197,160,89,0.3)] hover:border-gold transition-colors overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/10 transition-colors" />
        <Sparkles className="relative z-10 w-6 h-6 md:w-7 md:h-7" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[110] w-[calc(100vw-3rem)] sm:w-[400px] h-[550px] bg-white/95 backdrop-blur-2xl border border-ink/5 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-ink/5 flex items-center justify-between bg-ink text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center bg-gold/10">
                  <Sparkles className="text-gold w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm tracking-tight">Skin Concierge</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] uppercase tracking-widest text-gold font-bold">Laboratorio Activo</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] space-y-1.5 ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className="flex items-center gap-2 mb-1">
                      {message.role === 'assistant' ? (
                        <span className="text-[9px] uppercase tracking-tighter text-gold font-bold">Evocare Logic</span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-tighter text-gray-400 font-bold">Paciente</span>
                      )}
                    </div>
                    <div className={`
                      px-5 py-4 rounded-[26px] text-sm leading-relaxed
                      ${message.role === 'user' 
                        ? 'bg-gold text-ink font-medium rounded-tr-none' 
                        : 'bg-pearl border border-ink/5 text-ink/80 rounded-tl-none'}
                     shadow-sm`}>
                      {message.content}
                    </div>
                    <span className="text-[8px] text-gray-400 uppercase tracking-widest">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] space-y-1.5 flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] uppercase tracking-tighter text-gold font-bold">Procesando</span>
                    </div>
                    <div className="px-5 py-4 bg-pearl border border-ink/5 rounded-[26px] rounded-tl-none shadow-sm flex items-center gap-3">
                      <Loader2 className="w-4 h-4 text-gold animate-spin" />
                      <span className="text-xs text-ink/40 font-light italic">Analizando arquitectura celular...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-600 leading-normal">{error}</p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-ink/5 bg-white">
              <div className="relative group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Consulte sobre su piel..."
                  className="w-full bg-pearl border border-ink/5 rounded-full px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-gold/30 pr-14 transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className={`absolute right-2 top-2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    inputValue.trim() && !isLoading ? 'bg-gold text-ink' : 'bg-gray-100 text-gray-400 opacity-50'
                  }`}
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4">
                <span className="text-[9px] text-gray-400 uppercase tracking-widest">Protocolo Bioseguro</span>
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="text-[9px] text-gray-400 uppercase tracking-widest">IA Generativa de Lujo</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
