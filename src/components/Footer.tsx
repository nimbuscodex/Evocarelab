/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink">Navegación</h4>
            <ul className="space-y-4 text-sm font-light text-gray-400">
              <li><Link to="/ingredientes" className="hover:text-gold transition-colors">Ciencia de Ingredientes</Link></li>
              <li><Link to="/ritual" className="hover:text-gold transition-colors">El Ritual</Link></li>
              <li><Link to="/contacto" className="hover:text-gold transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink">Legal</h4>
            <ul className="space-y-4 text-sm font-light text-gray-400">
              <li><Link to="/envios-devoluciones" className="hover:text-gold transition-colors">Envíos y Devoluciones</Link></li>
              <li><Link to="/aviso-legal" className="hover:text-gold transition-colors">Aviso Legal</Link></li>
              <li><Link to="/privacidad" className="hover:text-gold transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/cookies" className="hover:text-gold transition-colors">Política de Cookies</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-ink">Sede Central</h4>
            <p className="text-sm font-light text-gray-400 leading-relaxed">
              Calle Lisboa 6, Nave 23<br />
              Polígono Industrial Albresa<br />
              Valdemoro, 28340, Madrid
            </p>
          </div>
        </div>

        <div className="pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] uppercase tracking-widest text-gray-300">
            © 2026 Evocarelab Science. Todos los derechos reservados.
          </p>
          <div className="flex gap-8 text-[10px] uppercase tracking-widest text-gray-300">
            <span>Diseño por Evocarelab Team</span>
            <span className="text-gold opacity-50">•</span>
            <span>Biotecnología Aplicada</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
