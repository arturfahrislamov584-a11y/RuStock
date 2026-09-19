import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Zap, LogOut, CreditCard, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, credits, user, logout } = useStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/catalog', label: 'Каталог' },
    { to: '/videos', label: 'Видео' },
    { to: '/tools', label: 'ИИ-инструменты' },
    { to: '/generate', label: 'Генерация' },
    { to: '/pricing', label: 'Тарифы' },
  ];

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:shadow-lg group-hover:shadow-primary/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">
              Ру<span className="text-primary">Сток</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-dark-600 text-white shadow-sm'
                    : 'text-text-secondary hover:text-white hover:bg-dark-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/generate"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 border border-border rounded-lg text-sm hover:border-accent-yellow/30 hover:shadow-sm hover:shadow-accent-yellow/5 transition-all duration-300"
                >
                  <Zap className="w-3.5 h-3.5 text-accent-yellow" />
                  <span className="font-medium">{credits}</span>
                  <span className="text-text-muted">кредитов</span>
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-dark-700 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-sm font-bold text-primary group-hover:scale-105 transition-transform">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </button>

                  <div
                    className={`absolute right-0 top-full mt-2 w-56 bg-dark-700 border border-border rounded-xl shadow-2xl z-50 overflow-hidden transition-all duration-200 origin-top-right ${
                      userMenuOpen
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}
                    <div className="relative z-50 p-3 border-b border-border">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-text-muted">{user?.email}</p>
                    </div>
                    <div className="relative z-50 p-1.5">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-dark-600 rounded-lg transition-all duration-150"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Личный кабинет
                      </Link>
                      {user?.role === 'author' && (
                        <Link
                          to="/author"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-primary hover:bg-dark-600 rounded-lg transition-all duration-150"
                        >
                          <CreditCard className="w-4 h-4" />
                          Кабинет автора
                        </Link>
                      )}
                      <Link
                        to="/upload"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-dark-600 rounded-lg transition-all duration-150"
                      >
                        <CreditCard className="w-4 h-4" />
                        Загрузить контент
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-150"
                      >
                        <LogOut className="w-4 h-4" />
                        Выйти
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-white transition-colors"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-dark-700 transition-colors"
          >
            <div className="relative w-5 h-5">
              <Menu className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${mobileOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
              <X className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${mobileOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
            </div>
          </button>
        </div>
      </div>

      <div
        className={`md:hidden border-t border-border bg-dark-800 transition-all duration-300 overflow-hidden ${
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 border-t-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {navLinks.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-white hover:bg-dark-700 transition-all duration-200"
              style={{ transitionDelay: mobileOpen ? `${i * 50}ms` : '0ms' }}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-border my-2" />
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-dark-700 transition-all duration-200"
              >
                <LayoutDashboard className="w-4 h-4" /> Личный кабинет
              </Link>
              {user?.role === 'author' && (
                <Link
                  to="/author"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-primary hover:bg-dark-700 transition-all duration-200"
                >
                  <CreditCard className="w-4 h-4" /> Кабинет автора
                </Link>
              )}
              <div className="flex items-center gap-2 px-3 py-2.5 text-sm">
                <Zap className="w-4 h-4 text-accent-yellow" />
                <span className="font-medium">{credits}</span>
                <span className="text-text-muted">кредитов</span>
              </div>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 text-sm border border-border rounded-lg transition-colors hover:bg-dark-700">
                Войти
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 text-sm bg-primary text-white rounded-lg transition-colors hover:bg-primary-dark">
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
