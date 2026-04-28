import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Leaf, Hexagon, TestTubeDiagonal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Filosofia() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pilares = [
    {
      icon: <TestTubeDiagonal className="w-6 h-6 text-gold" />,
      title: t('pages.philosophy.pilar1_title'),
      desc: t('pages.philosophy.pilar1_desc')
    },
    {
      icon: <Hexagon className="w-6 h-6 text-gold" />,
      title: t('pages.philosophy.pilar2_title'),
      desc: t('pages.philosophy.pilar2_desc')
    },
    {
      icon: <Leaf className="w-6 h-6 text-gold" />,
      title: t('pages.philosophy.pilar3_title'),
      desc: t('pages.philosophy.pilar3_desc')
    }
  ];

  return (
    <div className="min-h-screen bg-pearl pt-32 pb-40">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto space-y-6 mb-24"
        >
          <span className="inline-block px-3 py-1 bg-ink/5 rounded-full text-[10px] uppercase tracking-[0.3em] font-medium text-ink">
            {t('pages.philosophy.badge')}
          </span>
          <h1 className="text-5xl md:text-6xl font-serif text-ink tracking-tight">
            {t('pages.philosophy.title')}<span className="italic font-light">{t('pages.philosophy.titleItalic')}</span>
          </h1>
          <p className="text-gray-500 font-light text-lg leading-relaxed">
            {t('pages.philosophy.intro')}
          </p>
        </motion.div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          {pilares.map((pilar, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100">
                {pilar.icon}
              </div>
              <h3 className="text-xl font-serif text-ink">{pilar.title}</h3>
              <p className="text-gray-500 font-light leading-relaxed">
                {pilar.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Deep Dive Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="bg-white rounded-[40px] p-12 md:p-20 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-16 items-center"
        >
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-4xl font-serif text-ink">
              {t('pages.philosophy.section_title')}<span className="italic font-light">{t('pages.philosophy.section_titleItalic')}</span>
            </h2>
            <div className="space-y-6 text-gray-500 font-light leading-relaxed">
              <p>
                {t('pages.philosophy.section_p1')}
              </p>
              <p>
                {t('pages.philosophy.section_p2')}
              </p>
              <p className="font-medium text-ink">
                "{t('pages.philosophy.section_p3')}"
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/3 aspect-[4/5] bg-neutral-100 rounded-3xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-ink/5 group-hover:bg-transparent transition-colors duration-700 z-10" />
            <img 
              src="https://images.unsplash.com/photo-1579165462826-b088924b172a?auto=format&fit=crop&q=80&w=800" 
              alt="Detalle de laboratorio macro" 
              className="object-cover w-full h-full scale-105 group-hover:scale-100 transition-transform duration-1000"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
