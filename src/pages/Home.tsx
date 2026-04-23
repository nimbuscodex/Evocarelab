/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Hero from '../components/Hero';
import ProblemSolution from '../components/ProblemSolution';
import Benefits from '../components/Benefits';
import Product from '../components/Product';
import Ingredients from '../components/Ingredients';
import Testimonials from '../components/Testimonials';
import HowToUse from '../components/HowToUse';
import Philosophy from '../components/Philosophy';
import FinalCTA from '../components/FinalCTA';
import BeforeAfter from '../components/BeforeAfter';
import Newsletter from '../components/Newsletter';
import { supabase } from "../lib/supabase"
import { useEffect, useState } from "react"

export default function Home() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")

      if (!error && data) setProducts(data)
    }

    loadProducts()
  }, [])

  return (
    <>
      <Hero />
      <ProblemSolution />
      <Benefits />
      <Product />
      
      {/* Supabase Dynamic Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p: any) => (
              <div key={p.id} className="p-6 rounded-3xl bg-neutral-50 border border-neutral-100 flex flex-col gap-2">
                <h2 className="text-xl font-serif text-ink">{p.name}</h2>
                <p className="text-gold font-bold">{p.price}€</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Ingredients />
      <HowToUse />
      <BeforeAfter />
      <Testimonials />
      <Philosophy />
      <Newsletter />
      <FinalCTA />
    </>
  );
}
