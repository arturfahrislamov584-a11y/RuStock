import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, Image, Video, Sparkles, Shield, CreditCard,
  Search, ChevronRight, TrendingUp, Heart,
  Bot, Palette, FileImage, Wand2, Loader2, Star, User
} from 'lucide-react';
import { getPixabayPopular, pixabayToStock } from '../lib/pixabay';
import { useStore } from '../store/useStore';
import AnimatedSection from '../components/ui/AnimatedSection';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Marquee, { MarqueeItem } from '../components/ui/Marquee';
import FloatingParticles from '../components/ui/FloatingParticles';

type StockItem = ReturnType<typeof pixabayToStock>;

const features = [
  { icon: Image, title: 'Миллионы фото', desc: 'Поиск по базе Pixabay: бизнес, природа, архитектура и тысячи других категорий', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Bot, title: 'ИИ-генерация', desc: 'Создавайте уникальный контент нейросетями Flux, DALL-E, Midjourney', color: 'text-accent-blue', bg: 'bg-accent-blue/10' },
  { icon: Video, title: 'Генерация видео', desc: 'AI-видео из текстового описания: Kling, Runway, Pika', color: 'text-accent-green', bg: 'bg-accent-green/10' },
  { icon: Shield, title: 'Юридическая чистота', desc: '100% легальный контент — никаких исков за авторские права', color: 'text-accent-yellow', bg: 'bg-accent-yellow/10' },
  { icon: CreditCard, title: 'Система кредитов', desc: 'Фото и видео бесплатно. Платите только за ИИ-генерацию. Тарифы от 1500₽/мес', color: 'text-primary-light', bg: 'bg-primary-light/10' },
  { icon: Palette, title: 'Для дизайнеров', desc: 'Bento-сетка, фильтры, мокеты — всё как на Envato', color: 'text-purple-400', bg: 'bg-purple-400/10' },
];

const marqueeWords = [
  'Фото', 'Видео', 'ИИ-Генерация', 'Векторы', 'Иллюстрации', 'Шаблоны',
  'Стоковый контент', 'Лицензия', 'Бизнес', 'Маркетинг', 'Дизайн',
  'Реклама', 'Презентации', 'Соцсети', 'Блоги', 'E-commerce',
];

const steps = [
  { step: '01', title: 'Выберите тариф', desc: 'Оформите подписку и получите кредиты', icon: CreditCard },
  { step: '02', title: 'Найдите или создайте', desc: 'Поиск миллионов фото или ИИ-генерация', icon: Search },
  { step: '03', title: 'Используйте легально', desc: 'Полная юридическая гарантия', icon: Shield },
];

export default function Home() {
  const { isAuthenticated } = useStore();
  const [popular, setPopular] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPixabayPopular(1, 8)
      .then((data) => setPopular(data.hits.map(pixabayToStock)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />

        <FloatingParticles className="absolute inset-0 pointer-events-none" count={8} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <AnimatedSection animation="fade-up" delay={0}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-6 animate-glow-pulse">
                <Sparkles className="w-4 h-4" />
                Платформа нового поколения для бизнеса в СНГ
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={100}>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
                Стоковый контент
                <br />
                <span className="text-gradient-animated">с ИИ-генерацией</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200}>
              <p className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
                Единая платформа: миллионы лицензионных фото + генерация уникального контента нейросетями. Без юридических рисков.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={300}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to={isAuthenticated ? '/catalog' : '/register'}
                  className="btn-glow w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25"
                >
                  Начать бесплатно
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/catalog"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-dark-700 hover:bg-dark-600 border border-border text-white font-medium rounded-xl transition-all hover:border-primary/30"
                >
                  <Search className="w-4 h-4" />
                  Смотреть каталог
                </Link>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection animation="fade-up" delay={400} className="mt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { value: 1000000, suffix: '+', label: 'Фотографий', icon: FileImage },
                { value: 5, suffix: '', label: 'ИИ-моделей', icon: Bot },
                { value: 450, suffix: 'M₽', label: 'Цель рынка (SOM)', icon: TrendingUp },
                { value: 100, suffix: '%', label: 'Легальный контент', icon: Shield },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-dark-700/50 border border-border/50 hover:border-primary/20 transition-colors">
                  <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    <AnimatedCounter to={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ Marquee ═══ */}
      <section className="py-6 border-y border-border/50 bg-dark-800/50 overflow-hidden">
        <Marquee speed={40}>
          {marqueeWords.map((word, i) => (
            <MarqueeItem key={i}>
              <span className="flex items-center gap-3 text-sm text-text-muted font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                {word}
              </span>
            </MarqueeItem>
          ))}
        </Marquee>
      </section>

      {/* ═══ Features ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Всё что нужен вашему бизнесу</h2>
            <p className="text-text-secondary max-w-lg mx-auto">От стоковых фото до ИИ-генерации — один интерфейс</p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <AnimatedSection key={i} animation="fade-up" delay={i * 80}>
              <div className="bento-item-animated p-6 group cursor-pointer h-full">
                <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══ Popular from Pixabay ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <AnimatedSection animation="fade-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Популярный контент</h2>
              <p className="text-text-secondary text-sm mt-1">Реальные фото с Pixabay</p>
            </div>
            <Link to="/catalog" className="hidden sm:flex items-center gap-1.5 text-sm text-primary hover:text-primary-light transition-colors">
              Смотреть всё <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimatedSection>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {popular.map((item, i) => (
              <AnimatedSection key={item.id} animation="scale-in" delay={i * 60}>
                <Link
                  to={`/catalog?search=${encodeURIComponent(item.tags[0])}`}
                  className="bento-item group overflow-hidden block"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-dark-600">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" loading="lazy" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.title}</h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-text-muted">{item.author}</span>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <span className="flex items-center gap-0.5"><Heart className="w-3 h-3 text-red-400" />{item.likes}</span>
                        <span className="text-accent-green font-medium">Бесплатно</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}

        <div className="sm:hidden text-center mt-6">
          <Link to="/catalog" className="inline-flex items-center gap-1.5 text-sm text-primary">
            Смотреть всё <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ═══ Marquee (reverse) ═══ */}
      <section className="py-5 border-y border-border/50 bg-dark-800/30 overflow-hidden">
        <Marquee speed={35} reverse>
          {['Envato', 'Shutterstock', 'Adobe Stock', 'iStock', 'РуСток', 'Unsplash', 'Pexels', 'Depositphotos'].map((brand, i) => (
            <MarqueeItem key={i}>
              <span className="flex items-center gap-2 text-sm font-bold text-dark-500 uppercase tracking-wider">
                <Star className="w-3 h-3 text-primary/40" />
                {brand}
              </span>
            </MarqueeItem>
          ))}
        </Marquee>
      </section>

      {/* ═══ How it Works ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Как это работает</h2>
            <p className="text-text-secondary max-w-lg mx-auto">Три простых шага от регистрации до готового контента</p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <AnimatedSection key={i} animation="fade-up" delay={i * 150}>
              <div className="bento-item p-6 text-center relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                <div className="relative">
                  <div className="text-6xl font-black text-dark-500/30 mb-4 group-hover:text-primary/10 transition-colors duration-500">{s.step}</div>
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-primary/20">
                    <s.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{s.title}</h3>
                  <p className="text-sm text-text-muted">{s.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══ Testimonials marquee ═══ */}
      <section className="py-8 border-y border-border/50 bg-dark-800/30 overflow-hidden">
        <AnimatedSection animation="fade-in">
          <div className="text-center mb-6">
            <p className="text-sm text-text-muted">Нам доверяют</p>
          </div>
        </AnimatedSection>
        <Marquee speed={50}>
          {[
            { name: 'Алексей К.', role: 'Дизайнер', text: 'Лучшая платформа для стокового контента в СНГ' },
            { name: 'Мария В.', role: 'Маркетолог', text: 'ИИ-генерация экономит часы работы' },
            { name: 'Дмитрий С.', role: 'Фотограф', text: 'Удобно загружать и продавать свои работы' },
            { name: 'Елена П.', role: 'Блогер', text: 'Качественный контент для соцсетей за минуты' },
          ].map((review, i) => (
            <MarqueeItem key={i}>
              <div className="w-72 p-4 bg-dark-700/80 border border-border/50 rounded-xl">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-accent-yellow text-accent-yellow" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">«{review.text}»</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {review.name[0]}
                  </div>
                  <div>
                    <div className="text-xs font-medium">{review.name}</div>
                    <div className="text-[10px] text-text-muted">{review.role}</div>
                  </div>
                </div>
              </div>
            </MarqueeItem>
          ))}
        </Marquee>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <AnimatedSection animation="scale-in">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-dark-700 to-dark-800 border border-primary/20 p-8 sm:p-12 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-blue/5 rounded-full blur-[60px]" />
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="relative">
              <Wand2 className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce-gentle" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Готовы начать?</h2>
              <p className="text-text-secondary max-w-md mx-auto mb-6">50 бесплатных кредитов при регистрации. Попробуйте ИИ-генерацию прямо сейчас.</p>
              <Link
                to={isAuthenticated ? '/generate' : '/register'}
                className="btn-glow inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-primary/25 text-lg"
              >
                <Zap className="w-5 h-5" />
                {isAuthenticated ? 'Перейти к генерации' : 'Получить 50 кредитов'}
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══ Licenses ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-border/50">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Лицензии и условия использования</h2>
            <p className="text-text-secondary max-w-lg mx-auto">Прозрачные правила для каждого типа контента</p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <AnimatedSection animation="fade-up" delay={0}>
            <div className="bento-item p-6 h-full">
              <div className="w-11 h-11 bg-accent-green/10 rounded-xl flex items-center justify-center mb-4">
                <Image className="w-5 h-5 text-accent-green" />
              </div>
              <h3 className="text-base font-semibold mb-3">Фото и видео с стоков</h3>
              <p className="text-sm text-text-muted leading-relaxed mb-4">
                Контент с Wikimedia Commons распространяется под свободными лицензиями:
              </p>
              <ul className="text-sm text-text-secondary space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-0.5">✓</span>
                  <span><strong>CC BY</strong> — можно использовать, указывая автора</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-0.5">✓</span>
                  <span><strong>CC BY-SA</strong> — с указанием автора и той же лицензии</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-0.5">✓</span>
                  <span><strong>CC0</strong> — общественное достояние, без ограничений</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-0.5">✓</span>
                  <span><strong>PD</strong> — общественное достояние (Public Domain)</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-dark-600 rounded-lg">
                <p className="text-xs text-text-muted">
                  <strong className="text-text-secondary">Важно:</strong> при использовании в коммерческих проектах рекомендуется указывать автора и источник.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={100}>
            <div className="bento-item p-6 h-full">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold mb-3">ИИ-генерированный контент</h3>
              <p className="text-sm text-text-muted leading-relaxed mb-4">
                Изображения, созданные нейросетями на платформе:
              </p>
              <ul className="text-sm text-text-secondary space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-0.5">✓</span>
                  <span>Полная коммерческая лицензия</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-0.5">✓</span>
                  <span>Можно использовать в рекламе, на маркетплейсах</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-0.5">✓</span>
                  <span>Можно изменять, дорабатывать, комбинировать</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-0.5">✓</span>
                  <span>Не требуется указывать автора</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-dark-600 rounded-lg">
                <p className="text-xs text-text-muted">
                  <strong className="text-text-secondary">Важно:</strong> ИИ-контент не защищён авторским правом в большинстве юрисдикций, но мы предоставляем вам полные права на использование.
                </p>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bento-item p-6 h-full">
              <div className="w-11 h-11 bg-accent-blue/10 rounded-xl flex items-center justify-center mb-4">
                <User className="w-5 h-5 text-accent-blue" />
              </div>
              <h3 className="text-base font-semibold mb-3">Контент авторов</h3>
              <p className="text-sm text-text-muted leading-relaxed mb-4">
                Фото и видео, загруженные авторами платформы:
              </p>
              <ul className="text-sm text-text-secondary space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-0.5">✓</span>
                  <span>Лицензия на использование после покупки</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green mt-0.5">✓</span>
                  <span>Коммерческое и личное использование</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-yellow mt-0.5">⚠</span>
                  <span>Нельзя перепродавать как стоковый контент</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-yellow mt-0.5">⚠</span>
                  <span>Нельзя использовать в AI-обучении</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-dark-600 rounded-lg">
                <p className="text-xs text-text-muted">
                  <strong className="text-text-secondary">Важно:</strong> авторы сохраняют авторские права. Покупатель получает лицензию на использование, но не эксклюзивные права.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection animation="fade-in" delay={300}>
          <div className="mt-10 bento-item p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Часто задаваемые вопросы о лицензиях</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                { q: 'Можно ли использовать в рекламе на Facebook/Instagram?', a: 'Да, весь контент можно использовать в рекламе. Для фото со стоков — указывайте автора при возможности.' },
                { q: 'Можно ли использовать на маркетплейсах (Wildberries, Ozon)?', a: 'Да! ИИ-контент и стоковые фото идеально подходят для карточек товаров.' },
                { q: 'Нужно ли указывать "РуСток" как источник?', a: 'Нет, это не обязательно. Но если хотите — мы будем рады.' },
                { q: 'Что если я хочу эксклюзивные права на фото?', a: 'Для эксклюзивных лицензий свяжитесь с нами напрямую. Это возможно для авторского контента.' },
                { q: 'Можно ли изменять ИИ-контент?', a: 'Полностью! Меняйте цвета, кадрируйте, добавляйте текст — это ваш контент.' },
                { q: 'Какая юрисдикция для споров?', a: 'Российская Федерация. Все споры решаются в соответствии с законодательством РФ.' },
              ].map((item, i) => (
                <div key={i} className="bg-dark-600 rounded-lg p-4">
                  <p className="font-medium text-text-primary mb-1">{item.q}</p>
                  <p className="text-text-muted text-xs">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </section>
    </div>
  );
}
