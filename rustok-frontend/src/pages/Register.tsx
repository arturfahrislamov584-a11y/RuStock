import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, User, Building2, AlertCircle, Loader2, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [inn, setInn] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 6) {
      setError('Пароль минимум 6 символов');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, isBusiness ? inn : undefined);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Ошибка регистрации');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold">Регистрация</h1>
          <p className="text-sm text-text-muted mt-1">50 кредитов бесплатно при регистрации</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Имя *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-border rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.ru"
                className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-border rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Пароль *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full pl-10 pr-10 py-2.5 bg-dark-700 border border-border rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Повторите пароль *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ещё раз пароль"
                className="w-full pl-10 pr-10 py-2.5 bg-dark-700 border border-border rounded-xl text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                required
                minLength={6}
              />
            </div>
            {confirm && password === confirm && (
              <p className="text-xs text-accent-green flex items-center gap-1 mt-1">
                <Check className="w-3 h-3" /> Пароли совпадают
              </p>
            )}
          </div>

          {/* Business Toggle */}
          <div className="bento-item p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-sm font-medium">Юридическое лицо</span>
                  <p className="text-xs text-text-muted">Оплата по безналичному расчёту</p>
                </div>
              </div>
              <div
                onClick={() => setIsBusiness(!isBusiness)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isBusiness ? 'bg-primary' : 'bg-dark-500'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  isBusiness ? 'left-5' : 'left-1'
                }`} />
              </div>
            </label>

            {isBusiness && (
              <div className="mt-3 pt-3 border-t border-border">
                <label className="text-xs text-text-muted mb-1 block">ИНН организации</label>
                <input
                  type="text"
                  value={inn}
                  onChange={(e) => setInn(e.target.value)}
                  placeholder="10 или 12 цифр"
                  className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
                  maxLength={12}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Регистрация...
              </>
            ) : (
              <>
                Создать аккаунт
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-xs text-text-muted text-center">
            Регистрируясь, вы соглашаетесь с{' '}
            <a href="#" className="text-primary hover:text-primary-light">условиями использования</a>
          </p>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-primary hover:text-primary-light font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
