/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Truck, Check, Loader2, ArrowLeft, ShieldCheck, Lock, ShoppingBag, ArrowRight, Globe, Tag, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import { getLocalizedPath } from '../lib/i18n-utils';


const stripePubKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePubKey ? loadStripe(stripePubKey) : Promise.resolve(null);

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language.startsWith('es');
  const { totalSubtotal, items, discount, discountCode, applyDiscount, removeDiscount } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  const finalTotal = totalSubtotal * (1 - discount);

  const checkoutSchema = z.object({
    email: z.string().email(t('checkout.val_email')),
    fullName: z.string().min(3, t('checkout.val_name')),
    phone: z.string().min(9, t('checkout.val_phone')),
    country: z.string().min(1),
    shippingMethod: z.enum(['delivery', 'pickup']),
    address: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional(),
  }).refine((data) => {
    if (data.shippingMethod === 'delivery') {
      return !!data.address && data.address.length >= 10 && 
             !!data.city && data.city.length >= 2 && 
             !!data.zipCode && /^\d{5}$/.test(data.zipCode);
    }
    return true;
  }, {
    message: t('checkout.val_shipping'),
    path: ["address"] 
  });

  type CheckoutData = z.infer<typeof checkoutSchema>;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (items.length === 0) {
      navigate(getLocalizedPath('home'));
    }
  }, [items, navigate]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingMethod: 'delivery',
      country: 'Spain'
    }
  });

  const shippingMethod = watch('shippingMethod');

  const onSubmit = async (data: CheckoutData) => {
    setIsProcessing(true);
    setError(null);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          origin: window.location.origin !== "null" ? window.location.origin : window.location.protocol + '//' + window.location.host,
          method: data.shippingMethod,
          shipping: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            country: data.country,
            address: data.shippingMethod === 'delivery' ? data.address : t('checkout.pickup'),
            city: data.shippingMethod === 'delivery' ? data.city : 'Madrid',
            zipCode: data.shippingMethod === 'delivery' ? data.zipCode : '28340'
          },
          discountCode: discountCode
        })
      });

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        result = await response.json();
      } else {
        const textError = await response.text();
        throw new Error(`Server returned non-JSON: ${response.status} ${textError.substring(0, 50)}`);
      }

      if (result.url) {
        setCheckoutUrl(result.url);
      } else {
        setError(result.message || t('checkout.server_error'));
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t('checkout.server_error'));
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pt-32 pb-24 px-6 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-20">
          
          <div className="lg:w-3/5 space-y-12">
            <div>
              <Link to={getLocalizedPath('home')} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-ink mb-12 group transition-colors">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                {t('checkout.continue')}
              </Link>
              <h1 className="text-5xl font-serif text-ink tracking-tight mb-4 italic">{t('checkout.title')}</h1>
              <p className="text-gray-400 font-light text-lg">{t('checkout.subtitle')}</p>
            </div>

            {checkoutUrl ? (
              <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-sm border border-neutral-100/50 space-y-8 text-center">
                <div className="w-20 h-20 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock size={32} />
                </div>
                <h2 className="text-3xl font-serif text-ink tracking-tight">{t('checkout.casiListo')}</h2>
                <p className="text-gray-500 font-light leading-relaxed">
                  {t('checkout.stripeNote')}
                </p>
                <div className="pt-8">
                  <a 
                    href={checkoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-3 bg-ink text-white py-5 px-10 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-neutral-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                  >
                    {t('checkout.payStripe')} <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
              <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-sm border border-neutral-100/50 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                    <Truck size={20} />
                  </div>
                  <h2 className="text-lg font-serif">{t('checkout.deliveryMode')}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setValue('shippingMethod', 'delivery')}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all",
                      shippingMethod === 'delivery' 
                        ? "border-gold bg-gold/5 text-gold" 
                        : "border-neutral-100 bg-neutral-50/30 text-gray-400 hover:border-neutral-200"
                    )}
                  >
                    <Truck size={24} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">{t('checkout.delivery')}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setValue('shippingMethod', 'pickup');
                    }}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all",
                      shippingMethod === 'pickup' 
                        ? "border-gold bg-gold/5 text-gold" 
                        : "border-neutral-100 bg-neutral-50/30 text-gray-400 hover:border-neutral-200"
                    )}
                  >
                    <ShoppingBag size={24} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">{t('checkout.pickup')}</span>
                  </button>
                </div>

                {shippingMethod === 'pickup' && (
                  <div className="p-6 bg-gold/5 border border-gold/10 rounded-3xl space-y-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gold">{t('checkout.pickupTitle')}</p>
                    <p className="text-xs text-gray-600 font-light leading-relaxed">
                      {t('checkout.pickupLoc')}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                      {t('checkout.name')} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      {...register("fullName")}
                      placeholder={t('checkout.placeholder_name')}
                      className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                    />
                    {errors.fullName && <p className="text-[10px] text-red-500 italic mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                      {t('checkout.email')} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      {...register("email")}
                      placeholder={t('checkout.placeholder_email')}
                      className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                    />
                    {errors.email && <p className="text-[10px] text-red-500 italic mt-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                      {t('checkout.phone')} <span className="text-red-500">*</span>
                    </label>
                    <input 
                      {...register("phone")}
                      placeholder={t('checkout.placeholder_phone')}
                      className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 italic mt-1">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                      {t('checkout.country')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        {...register("country")}
                        className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="Spain">{t('checkout.countrySpain')}</option>
                        <option value="International">{t('checkout.countryRest')}</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <Globe size={18} />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {shippingMethod === 'delivery' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden"
                      >
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                            {t('checkout.address')} <span className="text-red-500">*</span>
                          </label>
                          <input 
                            {...register("address")}
                            placeholder={t('checkout.placeholder_address')}
                            className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                          />
                          {errors.address && <p className="text-[10px] text-red-500 italic mt-1">{errors.address.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                            {t('checkout.city')} <span className="text-red-500">*</span>
                          </label>
                          <input 
                            {...register("city")}
                            placeholder={t('checkout.placeholder_city')}
                            className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                          />
                          {errors.city && <p className="text-[10px] text-red-500 italic mt-1">{errors.city.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                            {t('checkout.zip')} <span className="text-red-500">*</span>
                          </label>
                          <input 
                            {...register("zipCode")}
                            placeholder={t('checkout.placeholder_zip')}
                            maxLength={5}
                            className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                          />
                          {errors.zipCode && <p className="text-[10px] text-red-500 italic mt-1">{errors.zipCode.message}</p>}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-sm border border-neutral-100/50 space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <h2 className="text-lg font-serif">{t('checkout.securePayment')}</h2>
                  </div>
                </div>

                <div className="text-sm font-light text-gray-500">
                  <p>{t('checkout.stripeDesc')}</p>
                </div>
              </div>

              {error && (
                <div className="p-6 bg-red-50 border border-red-100 text-red-500 rounded-2xl text-xs uppercase tracking-widest text-center animate-shake">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full bg-ink text-white py-10 rounded-full text-[12px] uppercase tracking-[0.4em] font-bold cta-btn flex items-center justify-center gap-4 disabled:opacity-50 group hover:shadow-2xl transition-all"
              >
                {isProcessing ? (
                  <>{t('checkout.processing')} <Loader2 size={24} className="animate-spin" /></>
                ) : (
                  <>{t('checkout.checkoutButton')} • {finalTotal.toFixed(2)}€ <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
                )}
              </button>
            </form>
            )}
          </div>

          <div className="lg:w-2/5">
            <div className="sticky top-40 space-y-10">
              <div className="bg-pearl p-12 rounded-[60px] border border-neutral-100 shadow-xl space-y-10">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} className="text-ink" />
                  <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold">{t('checkout.summary')}</h3>
                </div>

                <div className="space-y-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-6">
                      <div className="w-20 h-24 bg-shimmer rounded-xl overflow-hidden border border-neutral-100 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-grow py-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-serif">{item.name}</h4>
                          <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">{t('checkout.qty')}: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-ink">{(item.price * item.quantity).toFixed(2)}€</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-neutral-100/50">
                  {!discountCode ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                          type="text" 
                          placeholder={t('checkout.promoPlaceholder') || 'Código de descuento'}
                          value={promoInput}
                          onChange={(e) => {
                            setPromoInput(e.target.value);
                            setPromoError(null);
                          }}
                          className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl py-4 pl-12 pr-4 text-xs uppercase tracking-widest focus:ring-1 focus:ring-gold outline-none transition-all"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const success = applyDiscount(promoInput);
                            if (!success) setPromoError(t('checkout.invalidCode') || 'Código inválido');
                            else setPromoInput('');
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-ink text-white text-[8px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all hover:bg-gold"
                        >
                          {t('checkout.apply') || 'Aplicar'}
                        </button>
                      </div>
                      {promoError && <p className="text-[9px] text-red-500 uppercase tracking-widest px-4">{promoError}</p>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-gold/5 border border-gold/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Tag className="text-gold" size={16} />
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-gold">{t('checkout.applied') || 'Descuento Aplicado'}</p>
                          <p className="text-xs font-serif text-ink">{discountCode} (-{Math.round(discount * 100)}%)</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={removeDiscount}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-8 border-t border-neutral-100/50 space-y-6">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="uppercase tracking-widest">{t('checkout.subtotal')}</span>
                    <span>{totalSubtotal.toFixed(2)}€</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-gold">
                      <span className="uppercase tracking-widest">{t('checkout.discount')}</span>
                      <span>-{(totalSubtotal * discount).toFixed(2)}€</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="uppercase tracking-widest">{t('checkout.shipping')}</span>
                    <span className="text-gold font-bold italic">{t('checkout.free')}</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink">{t('checkout.total')}</span>
                    <span className="text-3xl font-serif">{finalTotal.toFixed(2)}€</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[30px] border border-neutral-100 flex items-center gap-6">
                <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center text-ink">
                  <ShieldCheck size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-ink">{t('checkout.guarantee')}</p>
                  <p className="text-[10px] text-gray-400 font-light italic">{t('checkout.guaranteeDesc')}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
