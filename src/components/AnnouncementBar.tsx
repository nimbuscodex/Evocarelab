import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, RotateCcw, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AnnouncementBar() {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);

  const messages = [
    { text: t('announcement.msg1'), icon: <Truck size={12} /> },
    { text: t('announcement.msg2'), icon: <RotateCcw size={12} /> },
    { text: t('announcement.msg3'), icon: <Wallet size={12} /> },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="bg-ink text-white py-2 overflow-hidden border-b border-white/5">
      <div className="container mx-auto px-6 relative h-4 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="flex items-center gap-3 whitespace-nowrap"
          >
            <span className="text-gold opacity-80">{messages[index]?.icon}</span>
            <span className="text-[9px] uppercase tracking-[0.3em] font-medium font-sans">
              {messages[index]?.text}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
