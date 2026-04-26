/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import IngredientsPage from './pages/IngredientsPage';
import Ritual from './pages/Ritual';
import Contact from './context/Contact';
import ProductDetail from './pages/ProductDetail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiesPolicy from './pages/CookiesPolicy';
import AvisoLegal from './pages/AvisoLegal';
import PoliticaEnvios from './pages/PoliticaEnvios';
import Filosofia from './pages/Filosofia';
import ElSecreto from './pages/ElSecreto';
import CheckoutPage from './pages/CheckoutPage';
import Store from './pages/Store';
import SuccessPage from './pages/SuccessPage';
import AdminPage from './pages/AdminPage';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import LegalDrawer from './components/LegalDrawer';
import CookieGate from './components/CookieGate';
import DiscountPopup from './components/DiscountPopup';
import Footer from './components/Footer';
import FinalCTA from './components/FinalCTA';

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCheckout = location.pathname === '/checkout';

  return (
    <div className="flex flex-col min-h-screen selection:bg-ink selection:text-white relative">
      {!isAdmin && <Navbar />}
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
          <Route path="/aviso-legal" element={<AvisoLegal />} />
          <Route path="/envios-devoluciones" element={<PoliticaEnvios />} />
          <Route path="/filosofia" element={<Filosofia />} />
          <Route path="/el-secreto" element={<ElSecreto />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      {!isAdmin && !isCheckout && <FinalCTA />}
      {!isAdmin && <Footer />}
      {!isAdmin && !isCheckout && <DiscountPopup />}
      <CartDrawer />
      <LegalDrawer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <CookieGate>
          <AppContent />
        </CookieGate>
      </CartProvider>
    </BrowserRouter>
  );
}

