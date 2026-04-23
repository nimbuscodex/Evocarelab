/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Truck, Check, Loader2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

const checkoutSchema = z.object({
  email: z.string().email("Email inválido"),
  fullName: z.string().min(3, "Mínimo 3 caracteres"),
  address: z.string().min(10, "Dirección demasiado corta"),
  cardNumber: z.string().regex(/^\d{16}$/, "Deben ser 16 dígitos"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Formato MM/YY"),
  cvv: z.string().regex(/^\d{3}$/, "3 dígitos")
});

type CheckoutData = z.infer<typeof checkoutSchema>;

interface CheckoutProps {
  onBack: () => void;
}

export default function Checkout({ onBack }: CheckoutProps) {
  const { totalSubtotal, items, clearCart } = useCart();
  const [step, setStep] = useState<1 | 2>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cardNumber: "4242424242424242" // Demo hint
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
      setError("Error de conexión con el servidor");
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
        <h3 className="text-2xl font-serif">¡Pedido Confirmado!</h3>
        <p className="text-gray-400 font-light max-w-xs text-sm">
          Gracias por confiar en Evocarelab. Tu pedido <span className="font-bold text-ink">{successOrder}</span> está siendo preparado para su envío.
        </p>
        <div className="pt-6">
          <p className="text-[10px] uppercase tracking-widest text-gray-300">Recibirás un email de confirmación pronto.</p>
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
        <ArrowLeft size={14} /> Regresar a la bolsa
      </button>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 flex-grow">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-ink">
            <Truck size={18} />
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold">Detalles de Envío</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <input 
                {...register("fullName")}
                placeholder="Nombre Completo"
                className="w-full bg-white border-b border-gray-100 py-3 text-sm focus:border-ink outline-none transition-colors"
              />
              {errors.fullName && <p className="text-[10px] text-red-400 uppercase italic">{errors.fullName.message}</p>}
            </div>
            
            <div className="space-y-1">
              <input 
                {...register("email")}
                placeholder="Email"
                className="w-full bg-white border-b border-gray-100 py-3 text-sm focus:border-ink outline-none transition-colors"
              />
              {errors.email && <p className="text-[10px] text-red-400 uppercase italic">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-1">
              <input 
                {...register("address")}
                placeholder="Dirección de Envío"
                className="w-full bg-white border-b border-gray-100 py-3 text-sm focus:border-ink outline-none transition-colors"
              />
              {errors.address && <p className="text-[10px] text-red-400 uppercase italic">{errors.address.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 text-ink">
            <CreditCard size={18} />
            <h3 className="text-[11px] uppercase tracking-[0.2em] font-bold">Método de Pago</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <input 
                {...register("cardNumber")}
                placeholder="Número de Tarjeta"
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
            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Total Final</p>
            <p className="text-2xl font-serif">{totalSubtotal}€</p>
          </div>
          
          <button 
            type="submit"
            disabled={isProcessing}
            className="w-full bg-ink text-white py-6 text-[10px] uppercase tracking-[0.3em] font-bold cta-btn flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? (
              <>Procesando... <Loader2 size={16} className="animate-spin" /></>
            ) : (
              "Confirmar y Pagar"
            )}
          </button>
          <p className="text-center text-[9px] text-gray-300 mt-4 tracking-widest">PAGO CIERTO Y SEGURO (AES-256)</p>
        </div>
      </form>
    </div>
  );
}
