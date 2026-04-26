import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DiscountPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const discountCode = 'EVO10';

  useEffect(() => {
    // Check if the user has already seen the popup
    const hasSeenPopup = localStorage.getItem('hasSeenDiscountPopup');
    
    if (!hasSeenPopup) {
      // Show popup after 5 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenDiscountPopup', 'true');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row"
          >
            <div className="relative w-full p-8 flex flex-col items-center text-center">
              <button 
                onClick={closePopup}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold">%</span>
              </div>
              
              <h3 className="text-2xl font-semibold text-ink mb-2">¡Bienvenido a EVOCARELAB!</h3>
              <p className="text-gray-600 mb-6">
                Disfruta de un <strong>10% de descuento</strong> en tu primera compra con nosotros.
              </p>
              
              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 flex items-center justify-between group">
                <span className="font-mono text-xl font-bold tracking-wider text-ink ml-4">{discountCode}</span>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {copied ? (
                    <><CheckCircle className="w-4 h-4 text-emerald-500" /> Copiado</>
                  ) : (
                    <><Copy className="w-4 h-4 text-gray-500 group-hover:text-ink" /> Copiar</>
                  )}
                </button>
              </div>
              
              <button
                onClick={() => {
                  closePopup();
                }}
                className="w-full bg-ink text-white py-3.5 rounded-xl font-medium hover:bg-ink-light transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
