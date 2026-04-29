/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
import Home from './pages/Home';
import IngredientsPage from './pages/IngredientsPage';
import Ritual from './pages/Ritual';
import Contact from './pages/ContactPage';
import ProductDetail from './pages/ProductDetail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiesPolicy from './pages/CookiesPolicy';
import AvisoLegal from './pages/AvisoLegal';
import PoliticaEnvios from './pages/PoliticaEnvios';
import Filosofia from './pages/Filosofia';
import ElSecreto from './pages/ElSecreto';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import AdminPage from './pages/AdminPage';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import LegalDrawer from './components/LegalDrawer';
import CookieGate from './components/CookieGate';
import DiscountPopup from './components/DiscountPopup';
import Footer from './components/Footer';
import FinalCTA from './components/FinalCTA';
import ScrollToTop from './components/ScrollToTop';
import LanguageHandler from './components/LanguageHandler';
import { useTranslation } from 'react-i18next';

function AppRoutes() {
  const { t } = useTranslation();
  
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path={t('routes.ingredients')} element={<IngredientsPage />} />
      <Route path={t('routes.ritual')} element={<Ritual />} />
      <Route path={t('routes.contact')} element={<Contact />} />
      <Route path={t('routes.product')} element={<ProductDetail />} />
      <Route path={t('routes.privacy')} element={<PrivacyPolicy />} />
      <Route path={t('routes.cookies')} element={<CookiesPolicy />} />
      <Route path={t('routes.legal')} element={<AvisoLegal />} />
      <Route path={t('routes.shipping')} element={<PoliticaEnvios />} />
      <Route path={t('routes.philosophy')} element={<Filosofia />} />
      <Route path={t('routes.secret')} element={<ElSecreto />} />
      <Route path={t('routes.checkout')} element={<CheckoutPage />} />
      <Route path={t('routes.success')} element={<SuccessPage />} />
      
      {/* Admin remains outside or with its own logic */}
      <Route path="admin" element={<AdminPage />} />
      
      {/* Fallback for invalid paths within a language */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCheckout = location.pathname.includes('/checkout');

  return (
    <div className="flex flex-col min-h-screen selection:bg-ink selection:text-white relative">
      <ScrollToTop />
      {!isAdmin && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <AnnouncementBar />
          <Navbar />
        </div>
      )}
      <main className={`flex-grow ${!isAdmin ? 'pt-28 md:pt-32' : ''}`}>
        <Routes>
          <Route path="/:lang/*" element={<LanguageHandler><AppRoutes /></LanguageHandler>} />
          <Route path="*" element={<LanguageHandler><Home /></LanguageHandler>} />
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

