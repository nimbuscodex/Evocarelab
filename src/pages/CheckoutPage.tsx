/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Truck, Check, Loader2, ArrowLeft, ShieldCheck, Lock, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { loadStripe } from '@stripe/stripe-js';

const stripePubKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePubKey ? loadStripe(stripePubKey) : Promise.resolve(null);

const checkoutSchema = z.object({
  email: z.string().email("Email inválido"),
  fullName: z.string().min(3, "Mínimo 3 caracteres"),
  phone: z.string().min(9, "Teléfono inválido"),
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
  message: "Por favor, completa todos los datos de envío correctamente",
  path: ["address"] // Error will point to address if delivery is active but incomplete
});

type CheckoutData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { totalSubtotal, items } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // If cart is empty, go back
    if (items.length === 0) {
      navigate('/');
    }
  }, [items, navigate]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingMethod: 'delivery'
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
            address: data.shippingMethod === 'delivery' ? data.address : 'RECOGIDA EN TIENDA',
            city: data.shippingMethod === 'delivery' ? data.city : 'Madrid',
            zipCode: data.shippingMethod === 'delivery' ? data.zipCode : '28340'
          }
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
        setError(result.message || "Error al crear la sesión de pago.");
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Error en la conexión con el servidor de pago");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 pt-32 pb-24 px-6 md:px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* Main Form Section */}
          <div className="lg:w-3/5 space-y-12">
            <div>
              <Link to="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-ink mb-12 group transition-colors">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Continuar comprando
              </Link>
              <h1 className="text-5xl font-serif text-ink tracking-tight mb-4 italic">Finalizar Pedido.</h1>
              <p className="text-gray-400 font-light text-lg">Introduce tus datos para procesar el envío de tu ritual de ciencia regenerativa.</p>
            </div>

            {checkoutUrl ? (
              <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-sm border border-neutral-100/50 space-y-8 text-center">
                <div className="w-20 h-20 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock size={32} />
                </div>
                <h2 className="text-3xl font-serif text-ink tracking-tight">Casi Listo</h2>
                <p className="text-gray-500 font-light leading-relaxed">
                  Por razones de seguridad de tu navegador y del editor, no podemos redirigirte automáticamente a Stripe en esta previsualización.
                  <br className="hidden md:block" />Por favor, haz clic abajo para abrir la pasarela segura en una nueva pestaña.
                </p>
                <div className="pt-8">
                  <a 
                    href={checkoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-3 bg-ink text-white py-5 px-10 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-neutral-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                  >
                    Proceder al Pago Seguro <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
              {/* Shipping Section */}
              <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-sm border border-neutral-100/50 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                    <Truck size={20} />
                  </div>
                  <h2 className="text-lg font-serif">Modo de Entrega</h2>
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
                    <span className="text-[10px] uppercase tracking-widest font-bold">Envío a Domicilio</span>
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
                    <span className="text-[10px] uppercase tracking-widest font-bold">Recogida en Tienda</span>
                  </button>
                </div>

                {shippingMethod === 'pickup' && (
                  <div className="p-6 bg-gold/5 border border-gold/10 rounded-3xl space-y-2">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gold">Ubicación de Recogida</p>
                    <p className="text-xs text-gray-600 font-light leading-relaxed">
                      Calle Lisboa 6, Nave 23, Polígono Industrial Albresa, Valdemoro, 28340, Madrid
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                      Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <input 
                      {...register("fullName")}
                      placeholder="Ej. Elena Rodríguez"
                      className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                    />
                    {errors.fullName && <p className="text-[10px] text-red-500 italic mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                      Correo Electrónico <span className="text-red-500">*</span>
                    </label>
                    <input 
                      {...register("email")}
                      placeholder="elena@ejemplo.com"
                      className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                    />
                    {errors.email && <p className="text-[10px] text-red-500 italic mt-1">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                      Teléfono de Contacto <span className="text-red-500">*</span>
                    </label>
                    <input 
                      {...register("phone")}
                      placeholder="+34 000 000 000"
                      className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 italic mt-1">{errors.phone.message}</p>}
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
                            Dirección Completa <span className="text-red-500">*</span>
                          </label>
                          <input 
                            {...register("address")}
                            placeholder="Calle, número, piso, puerta"
                            className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                          />
                          {errors.address && <p className="text-[10px] text-red-500 italic mt-1">{errors.address.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                            Ciudad <span className="text-red-500">*</span>
                          </label>
                          <input 
                            {...register("city")}
                            placeholder="Madrid"
                            className="w-full bg-neutral-50/50 border border-neutral-100 rounded-2xl px-6 py-4 text-sm focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all"
                          />
                          {errors.city && <p className="text-[10px] text-red-500 italic mt-1">{errors.city.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-gray-400 font-bold ml-1">
                            Código Postal <span className="text-red-500">*</span>
                          </label>
                          <input 
                            {...register("zipCode")}
                            placeholder="28001"
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

              {/* Payment Section - Replaced with Stripe Checkout */}
              <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-sm border border-neutral-100/50 space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                      <CreditCard size={20} />
                    </div>
                    <h2 className="text-lg font-serif">Pago Seguro</h2>
                  </div>
                  <div className="flex gap-2">
                    {/* Simplified logos icon block from Stripe */}
                  </div>
                </div>

                <div className="text-sm font-light text-gray-500">
                  <p>Serás redirigido a Stripe para completar tu compra de forma 100% segura. Aceptamos tarjetas de crédito, débito, Apple Pay y Google Pay.</p>
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
                  <>Procesando Pago <Loader2 size={24} className="animate-spin" /></>
                ) : (
                  <>Ir a Pagar con Stripe • {totalSubtotal}€ <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></>
                )}
              </button>
            </form>
            )}
          </div>

          {/* Sidebar / Order Summary */}
          <div className="lg:w-2/5">
            <div className="sticky top-40 space-y-10">
              <div className="bg-pearl p-12 rounded-[60px] border border-neutral-100 shadow-xl space-y-10">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} className="text-ink" />
                  <h3 className="text-[11px] uppercase tracking-[0.3em] font-bold">Resumen del Pedido</h3>
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
                          <p className="text-[10px] text-gray-400 tracking-widest uppercase mt-1">Cant: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-ink">{item.price * item.quantity}€</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-neutral-100/50 space-y-6">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="uppercase tracking-widest">Subtotal</span>
                    <span>{totalSubtotal}€</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span className="uppercase tracking-widest">Gasto de Envío</span>
                    <span className="text-gold font-bold italic">Gratis</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink">Total Final</span>
                    <span className="text-3xl font-serif">{totalSubtotal}€</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[30px] border border-neutral-100 flex items-center gap-6">
                <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center text-ink">
                  <ShieldCheck size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-ink">Garantía de Pureza</p>
                  <p className="text-[10px] text-gray-400 font-light italic">Envío seguro bajo estándares farmacéuticos.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
