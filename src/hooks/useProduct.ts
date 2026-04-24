import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  badge?: string;
}

// Default mask product as fallback
export const defaultProduct: Product = {
  id: 'triple-h-mask-1',
  name: 'Triple Hyaluronic Acid Mask',
  description: 'Nuestra fórmula magistral que combina colágeno biomimético de bajo peso molecular con un complejo de triple ácido hialurónico.',
  price: 29.95,
  image_url: 'https://www.kiyobeauty.com/cdn/shop/files/biodance-bio-collagen-real-deep-mask-1pc-PURESEOUL-UK-KBeauty-shop-2_1800x1800_0d187b16-fead-4418-b39a-2debfafbc0c3.webp?v=1756371372&width=1500',
  category: 'Mascarillas',
  badge: 'Más Vendido'
};

export function useProduct(productId: string = 'triple-h-mask-1') {
  const [product, setProduct] = useState<Product>(defaultProduct);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setProduct({
            ...defaultProduct,
            ...data
          });
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  return { product, loading };
}
