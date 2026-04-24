/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import IngredientsPage from './pages/IngredientsPage';
import Ritual from './pages/Ritual';
import Contact from './context/Contact';
import ProductDetail from './pages/ProductDetail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiesPolicy from './pages/CookiesPolicy';
import CheckoutPage from './pages/CheckoutPage';
import Store from './pages/Store';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import LegalDrawer from './components/LegalDrawer';
import CookieGate from './components/CookieGate';
import Footer from './components/Footer';

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <CookieGate>
          <div className="flex flex-col min-h-screen selection:bg-ink selection:text-white relative">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tienda" element={<Store />} />
                <Route path="/ingredientes" element={<IngredientsPage />} />
                <Route path="/ritual" element={<Ritual />} />
                <Route path="/contacto" element={<Contact />} />
                <Route path="/producto" element={<ProductDetail />} />
                <Route path="/privacidad" element={<PrivacyPolicy />} />
                <Route path="/cookies" element={<CookiesPolicy />} />
                <Route path="/checkout" element={<CheckoutPage />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
            <LegalDrawer />
          </div>
        </CookieGate>
      </CartProvider>
    </BrowserRouter>
  );
}

