/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedPath } from '../lib/i18n-utils';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-white border-t border-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink">{t('footer.nav')}</h4>
            <ul className="space-y-4 text-sm font-light text-gray-400">
              <li><Link to={getLocalizedPath('ingredients')} className="hover:text-gold transition-colors">{t('footer.science')}</Link></li>
              <li><Link to={getLocalizedPath('ritual')} className="hover:text-gold transition-colors">{t('nav.ritual')}</Link></li>
              <li><Link to={getLocalizedPath('contact')} className="hover:text-gold transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink">{t('footer.legal')}</h4>
            <ul className="space-y-4 text-sm font-light text-gray-400">
              <li><Link to={getLocalizedPath('shipping')} className="hover:text-gold transition-colors">{t('footer.shipping')}</Link></li>
              <li><Link to={getLocalizedPath('legal')} className="hover:text-gold transition-colors">{t('footer.legalNotice')}</Link></li>
              <li><Link to={getLocalizedPath('privacy')} className="hover:text-gold transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to={getLocalizedPath('cookies')} className="hover:text-gold transition-colors">{t('footer.cookies')}</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink">{t('footer.headquarters')}</h4>
            <p className="text-sm font-light text-gray-400 leading-relaxed">
              Calle Lisboa 6, Nave 23<br />
              Polígono Industrial Albresa<br />
              Valdemoro, 28340, Madrid
            </p>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-widest text-gray-300">
            {t('footer.rights')}
          </p>
          <div className="flex gap-8 text-[10px] uppercase tracking-widest text-gray-300">
            <span>{t('footer.design')}</span>
            <span className="text-gold opacity-50">•</span>
            <span>{t('footer.biotech')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
