import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, Download, Heart, CreditCard, BarChart3,
  Settings, Image, AlertCircle, Check, User, Lock, Crown
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { apiGetStats } from '../lib/apiClient';

const tabs = [
  { id: 'overview', label: 'Обзор', icon: BarChart3 },
  { id: 'downloads', label: 'История скачиваний', icon: Download },
  { id: 'favorites', label: 'Избранное', icon: Heart },
  { id: 'credits', label: 'Кредиты', icon: Zap },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export default function Dashboard() {
  const { user, credits, downloadHistory, generatedContent, favoriteIds, isAuthenticated, logout, updateProfile, changePassword } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [inn, setInn] = useState(user?.inn || '');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    apiGetStats().then(setStats).catch(() => {});
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setInn((user as any).inn || '');
    }
  }, [user]);

  if (!isAuthenticated || !user) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    setMsg('');
    const result = await updateProfile({ name, email, inn });
    setSaving(false);
    if (result.success) {
      setMsg('Профиль сохранён');
      setMsgType('ok');
    } else {
      setMsg(result.error || 'Ошибка');
      setMsgType('err');
    }
  };

  const handleChangePass = async () => {
    setSaving(true);
    setMsg('');
    const result = await changePassword(oldPass, newPass);
    setSaving(false);
    if (result.success) {
      setMsg('Пароль изменён');
      setMsgType('ok');
      setOldPass('');
      setNewPass('');
    } else {
      setMsg(result.error || 'Ошибка');
      setMsgType('err');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-xl font-bold text-primary">
            {user.name[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-border rounded-xl">
            <Zap className="w-4 h-4 text-accent-yellow" />
            <span className="font-bold">{credits}</span>
            <span className="text-sm text-text-muted">кредитов</span>
          </div>
          <span className="px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl text-sm text-primary font-medium capitalize">
            {user.plan}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-4 mb-6 border-b border-border -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setMsg(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-primary border-primary bg-primary/5'
                : 'text-text-muted border-transparent hover:text-white hover:bg-dark-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Кредитов', value: credits, icon: Zap, color: 'text-accent-yellow' },
              { label: 'Скачиваний', value: stats?.downloads ?? downloadHistory.length, icon: Download, color: 'text-accent-blue' },
              { label: 'Избранное', value: stats?.favorites ?? favoriteIds.length, icon: Heart, color: 'text-primary' },
              { label: 'Генераций', value: stats?.generations ?? generatedContent.length, icon: Image, color: 'text-accent-green' },
            ].map((stat) => (
              <div key={stat.label} className="bento-item p-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {user.role !== 'author' && (
            <Link
              to="/author"
              className="bento-item p-5 flex items-center gap-4 hover:border-primary/50 transition-colors group cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold group-hover:text-primary transition-colors">Станьте автором</div>
                <div className="text-xs text-text-muted">Загружайте контент и зарабатывайте до 70% от продаж</div>
              </div>
            </Link>
          )}

          <div className="bento-item p-5">
            <h3 className="text-base font-semibold mb-4">Последняя активность</h3>
            {downloadHistory.length > 0 || generatedContent.length > 0 ? (
              <div className="space-y-3">
                {generatedContent.slice(0, 3).map((g) => (
                  <div key={g.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent-green" />
                      <span className="text-sm">Сгенерировано: <span className="text-text-secondary">{g.prompt?.substring(0, 50)}</span></span>
                    </div>
                    <span className="text-xs text-accent-yellow flex items-center gap-0.5">
                      <Zap className="w-3 h-3" />{g.credits}
                    </span>
                  </div>
                ))}
                {downloadHistory.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent-blue" />
                      <span className="text-sm">Скачано: <span className="text-text-secondary">{d.content?.title || 'файл'}</span></span>
                    </div>
                    <span className="text-xs text-accent-yellow flex items-center gap-0.5">
                      <Zap className="w-3 h-3" />{d.credits}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Пока нет активности</p>
            )}
          </div>
        </div>
      )}

      {/* Downloads */}
      {activeTab === 'downloads' && (
        <div>
          {downloadHistory.length > 0 ? (
            <div className="space-y-3">
              {downloadHistory.map((d) => (
                <div key={d.id} className="bento-item p-4 flex items-center gap-4">
                  {d.content?.thumbnail && (
                    <img src={d.content.thumbnail} alt="" className="w-16 h-12 object-cover rounded-lg" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{d.content?.title || 'Файл'}</h3>
                    <p className="text-xs text-text-muted">{d.downloadedAt}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-accent-yellow">
                    <Zap className="w-3 h-3" />{d.credits}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Download className="w-12 h-12 text-dark-500 mx-auto mb-3" />
              <p className="text-sm text-text-muted">Скачиваний пока нет</p>
              <Link to="/catalog" className="text-sm text-primary hover:text-primary-light mt-2 inline-block">
                Перейти в каталог
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Favorites */}
      {activeTab === 'favorites' && (
        <div>
          {favoriteIds.length > 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-text-muted">{favoriteIds.length} избранных изображений</p>
              <Link to="/catalog" className="text-sm text-primary mt-2 inline-block">Открыть каталог</Link>
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="w-12 h-12 text-dark-500 mx-auto mb-3" />
              <p className="text-sm text-text-muted">Избранного пока нет</p>
              <Link to="/catalog" className="text-sm text-primary hover:text-primary-light mt-2 inline-block">
                Найти контент
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Credits */}
      {activeTab === 'credits' && (
        <div className="space-y-6">
          <div className="bento-item p-6 text-center">
            <Zap className="w-10 h-10 text-accent-yellow mx-auto mb-3" />
            <div className="text-4xl font-bold mb-1">{credits}</div>
            <div className="text-sm text-text-muted mb-4">доступных кредитов</div>
            <div className="w-full h-2 bg-dark-600 rounded-full overflow-hidden max-w-xs mx-auto mb-6">
              <div className="h-full bg-accent-yellow rounded-full" style={{ width: `${Math.min((credits / 500) * 100, 100)}%` }} />
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-xl transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Пополнить кредиты
            </Link>
          </div>

          <div className="bento-item p-5">
            <h3 className="text-base font-semibold mb-4">Статистика</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-600 rounded-lg p-3">
                <div className="text-xs text-text-muted">Всего потрачено</div>
                <div className="text-lg font-bold mt-1">{stats?.totalSpent || 0} кредитов</div>
              </div>
              <div className="bg-dark-600 rounded-lg p-3">
                <div className="text-xs text-text-muted">Текущий план</div>
                <div className="text-lg font-bold mt-1 capitalize">{user.plan}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-lg">
          {msg && (
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
              msgType === 'ok' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {msgType === 'ok' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {msg}
            </div>
          )}

          <div className="bento-item p-5">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Профиль
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Имя</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">ИНН (для юрлиц)</label>
                <input
                  type="text"
                  value={inn}
                  onChange={(e) => setInn(e.target.value)}
                  placeholder="Не указан"
                  className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>

          <div className="bento-item p-5">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Изменить пароль
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Текущий пароль</label>
                <input
                  type="password"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Новый пароль</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={handleChangePass}
                disabled={saving || !oldPass || !newPass}
                className="px-4 py-2 bg-dark-600 hover:bg-dark-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? 'Изменение...' : 'Изменить пароль'}
              </button>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl transition-colors"
          >
            Выйти из аккаунта
          </button>
        </div>
      )}
    </div>
  );
}
