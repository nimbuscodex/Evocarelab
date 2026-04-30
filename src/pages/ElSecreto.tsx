import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Droplets, Clock, ShieldCheck } from 'lucide-react';

export default function ElSecreto() {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <Droplets className="w-5 h-5 text-ink" />,
      title: t('pages.secret.feat1_title'),
      desc: t('pages.secret.feat1_desc')
    },
    {
      icon: <Clock className="w-5 h-5 text-ink" />,
      title: t('pages.secret.feat2_title'),
      desc: t('pages.secret.feat2_desc')
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-ink" />,
      title: t('pages.secret.feat3_title'),
      desc: t('pages.secret.feat3_desc')
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold rounded-full mix-blend-screen filter blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-3xl"
          >
            <span className="flex items-center gap-2 text-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              {t('pages.secret.badge')}
            </span>
            <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-8">
              {t('pages.secret.title')} <br /><span className="italic font-light text-gold text-opacity-90">{t('pages.secret.titleItalic')}</span>
            </h1>
            <p className="text-xl font-light text-gray-300 leading-relaxed max-w-2xl">
              {t('pages.secret.intro')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mechanics Section */}
      <section className="py-32 bg-pearl">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 space-y-8"
            >
              <h2 className="text-3xl lg:text-5xl font-serif text-ink leading-tight">
                {t('pages.secret.section_title')} <span className="italic font-light">{t('pages.secret.section_titleItalic')}</span>
              </h2>
              <div className="h-px w-24 bg-gold" />
              <p className="text-gray-500 font-light leading-relaxed text-lg">
                {t('pages.secret.section_p1')}
              </p>
              <p className="text-gray-500 font-light leading-relaxed text-lg">
                {t('pages.secret.section_p2')}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2"
            >
              <div className="space-y-6">
                {features.map((feat, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-6 items-start">
                    <div className="bg-pearl p-3 rounded-full shrink-0">
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="text-ink font-bold mb-2">{feat.title}</h4>
                      <p className="text-gray-500 text-sm font-light leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visual Transition */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <motion.h3 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-5xl font-serif text-ink tracking-tight"
          >
            {t('pages.secret.visual_title')} <span className="italic text-gold">{t('pages.secret.visual_titleItalic')}</span>{t('pages.secret.visual_subtitle')}
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-6 text-gray-500 font-light max-w-xl mx-auto"
          >
            {t('pages.secret.visual_desc')}
          </motion.p>
        </div>
      </section>
    </div>
  );
}
