import { Link } from 'react-router-dom';
import { Zap, Mail, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-dark-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                Ру<span className="text-primary">Сток</span>
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
              Гибридная B2B SaaS-платформа коммерческого контента с ИИ-генерацией для бизнеса в СНГ.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-dark-600 flex items-center justify-center text-text-muted hover:text-white hover:bg-dark-500 transition-colors">
                <Send className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-dark-600 flex items-center justify-center text-text-muted hover:text-white hover:bg-dark-500 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Продукт</h3>
            <ul className="space-y-2.5">
              {['Каталог', 'ИИ-генерация', 'Тарифы', 'Для бизнеса'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-text-muted hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Авторам</h3>
            <ul className="space-y-2.5">
              {['Стать автором', 'Выплаты', 'Лицензия', 'Правила'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-text-muted hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Компания</h3>
            <ul className="space-y-2.5">
              {['О нас', 'Блог', 'Контакты', 'Политика конфиденциальности'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-text-muted hover:text-white transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; 2026 РуСток. Все права защищены.
          </p>
          <p className="text-xs text-text-muted">
            100% легальный контент с полной юридической очисткой
          </p>
        </div>
      </div>
    </footer>
  );
}
