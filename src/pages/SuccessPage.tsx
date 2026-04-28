import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { getLocalizedPath } from '../lib/i18n-utils';

export default function SuccessPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const [isFinalizing, setIsFinalizing] = React.useState(true);
  const [isFinalized, setIsFinalized] = React.useState(false);
  const hasFinalizedRef = React.useRef(false);

  useEffect(() => {
    if (sessionId && !hasFinalizedRef.current) {
      hasFinalizedRef.current = true;
      clearCart();
      
      // Confirm the order and save to db
      const finalizeOrder = async () => {
        try {
          const res = await fetch('/api/finalize-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId })
          });
          const data = await res.json();
          if (data.success) {
            setIsFinalized(true);
          }
        } catch (error) {
          console.error("Error finalizing order", error);
        } finally {
          setIsFinalizing(false);
        }
      };

      finalizeOrder();
    } else {
      setIsFinalizing(false);
    }
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8 bg-pearl p-12 rounded-[60px] border border-neutral-100 shadow-2xl"
      >
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-ink text-white rounded-full flex items-center justify-center animate-bounce-slow">
            <Check size={48} />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-serif text-ink">{t('pages.success.gratitude')}</h2>
          <p className="text-gray-500 font-light leading-relaxed">
            {t('pages.success.p1')} {sessionId && <span className="block mt-2 text-xs italic text-gray-400 break-words">ID: {sessionId.substring(0, 20)}...</span>}
          </p>
          <p className="text-gray-500 font-light leading-relaxed">
            {t('pages.success.p2')}
          </p>
        </div>
        <div className="pt-6 space-y-4">
           <p className="text-[10px] uppercase tracking-widest text-gray-300">{t('pages.success.confirmation')}</p>
           <Link 
             to={getLocalizedPath('home')} 
             className="inline-block bg-ink text-white px-10 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-neutral-800 transition-all rounded-full"
           >
             {t('pages.success.backToHome')}
           </Link>
        </div>
      </motion.div>
    </div>
  );
}
