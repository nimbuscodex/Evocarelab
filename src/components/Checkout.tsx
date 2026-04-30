/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Truck, Check, Loader2, ArrowLeft, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';

interface CheckoutProps {
  onBack: () => void;
}

export default function Checkout({ onBack }: CheckoutProps) {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith('es');
  const { totalSubtotal, items, clearCart } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkoutSchema = z.object({
    email: z.string().email(t('checkout.val_email')),
    fullName: z.string().min(3, t('checkout.val_name')),
    country: z.string().min(1),
    address: z.string().min(10, t('checkout.val_address')),
    cardNumber: z.string().regex(/^\d{16}$/, t('checkout.val_card')),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, t('checkout.val_expiry')),
    cvv: z.string().regex(/^\d{3}$/, t('checkout.val_cvv'))
  });

  type CheckoutData = z.infer<typeof checkoutSchema>;

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cardNumber: "4242424242424242", // Demo hint
      country: "Spain"
    }
  });

  const onSubmit = async (data: CheckoutData) => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          paymentInfo: data
        })
      });

      const result = await response.json();
      if (result.success) {
        setSuccessOrder(result.orderId);
        clearCart();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(t('checkout.server_error'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (successOrder) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-ink text-white rounded-full flex items-center justify-center"
        >
          <Check size={40} />
        </motion.div>
        <h3 className="text-2xl font-serif">{t('checkout.successTitle')}</h3>
        <p className="text-gray-400 font-light max-w-xs text-sm">
          {t('checkout.successDesc', { orderId: successOrder })}
        </p>
        <div className="pt-6">
          <p className="text-[10px] uppercase tracking-widest text-gray-300">{t('checkout.successNote')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft size={14} /> {t('checkout.back')}
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 flex-grow">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-ink">
            <Truck size={18} />
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold">{t('checkout.shipping')}</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <input 
                {...register("fullName")}
                placeholder={t('checkout.name')}
                className="w-full bg-white border-b border-gray-100 py-3 text-sm focus:border-ink outline-none transition-colors"
              />
              {errors.fullName && <p className="text-[10px] text-red-400 uppercase italic">{errors.fullName.message}</p>}
            </div>
            
            <div className="space-y-1">
              <input 
                {...register("email")}
                placeholder={t('checkout.email')}
                className="w-full bg-white border-b border-gray-100 py-3 text-sm focus:border-ink outline-none transition-colors"
              />
              {errors.email && <p className="text-[10px] text-red-400 uppercase italic">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-1">
              <div className="relative">
                <select 
                  {...register("country")}
                  className="w-full bg-white border-b border-gray-100 py-3 text-sm focus:border-ink outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="Spain">{t('checkout.countrySpain')}</option>
                  {!isSpanish && <option value="International">{t('checkout.countryRest')}</option>}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <Globe size={16} />
                </div>
              </div>
              {errors.country && <p className="text-[10px] text-red-400 uppercase italic">{errors.country.message}</p>}
            </div>

            <div className="space-y-1">
              <input 
                {...register("address")}
                placeholder={t('checkout.address')}
                className="w-full bg-white border-b border-gray-100 py-3 text-sm focus:border-ink outline-none transition-colors"
              />
              {errors.address && <p className="text-[10px] text-red-400 uppercase italic">{errors.address.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 text-ink">
            <CreditCard size={18} />
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold">{t('checkout.payment')}</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <input 
                {...register("cardNumber")}
                placeholder={t('checkout.cardPlaceholder')}
                maxLength={16}
                className="w-full bg-white border-b border-gray-100 py-3 text-sm focus:border-ink outline-none transition-colors"
              />
              {errors.cardNumber && <p className="text-[10px] text-red-400 uppercase italic">{errors.cardNumber.message}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <input 
                  {...register("expiry")}
                  placeholder="MM/YY"
                  className="w-full bg-white border-b border-gray-100 py-3 text-sm focus:border-ink outline-none transition-colors"
                />
                {errors.expiry && <p className="text-[10px] text-red-400 uppercase italic">{errors.expiry.message}</p>}
              </div>
              <div className="space-y-1">
                <input 
                  {...register("cvv")}
                  placeholder="CVV"
                  maxLength={3}
                  className="w-full bg-white border-b border-gray-100 py-3 text-sm focus:border-ink outline-none transition-colors"
                />
                {errors.cvv && <p className="text-[10px] text-red-400 uppercase italic">{errors.cvv.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-500 rounded-xl text-[10px] uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <div className="pt-8 border-t border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{t('checkout.total')}</p>
            <p className="text-2xl font-serif">{totalSubtotal}€</p>
          </div>
          
          <button 
            type="submit"
            disabled={isProcessing}
            className="w-full bg-ink text-white py-6 text-[10px] uppercase tracking-[0.3em] font-bold cta-btn flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? (
              <>{t('checkout.processing')} <Loader2 size={16} className="animate-spin" /></>
            ) : (
              t('checkout.confirm')
            )}
          </button>
          <p className="text-center text-[9px] text-gray-300 mt-4 tracking-widest">{t('checkout.secure')}</p>
        </div>
      </form>
    </div>
  );
}
