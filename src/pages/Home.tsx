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

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemSolution />
      <Benefits />
      <Product />
      <Ingredients />
      <HowToUse />
      <Testimonials />
      <Philosophy />
      <Newsletter />
    </>
  );
}
