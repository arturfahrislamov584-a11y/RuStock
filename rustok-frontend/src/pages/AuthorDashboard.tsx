import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Upload, BarChart3, DollarSign, Eye, Download, Trash2,
  Loader2, AlertCircle, Check, Crown, Package, ExternalLink, TrendingUp
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  apiUpgradeToAuthor, apiGetAuthorContent, apiDeleteAuthorContent,
  apiGetAuthorStats, apiUploadContent
} from '../lib/apiClient';

const tabs = [
  { id: 'overview', label: 'Обзор', icon: BarChart3 },
  { id: 'content', label: 'Мой контент', icon: Package },
  { id: 'upload', label: 'Загрузить', icon: Upload },
  { id: 'earnings', label: 'Доходы', icon: DollarSign },
  { id: 'settings', label: 'Настройки', icon: Crown },
];

const categories = [
  'business', 'technology', 'nature', 'people', 'food',
  'travel', 'fashion', 'architecture', 'abstract', 'templates',
];

export default function AuthorDashboard() {
  const { user, isAuthenticated } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthor, setIsAuthor] = useState(false);
  const [loading, setLoading] = useState(true);

  // Author data
  const [stats, setStats] = useState<any>(null);
  const [content, setContent] = useState<any[]>([]);

  // Upload form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadCategory, setUploadCategory] = useState('abstract');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadThumb, setUploadThumb] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  // Upgrade form
  const [bio, setBio] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role === 'author') {
      setIsAuthor(true);
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadData = async () => {
    try {
      const [statsData, contentData] = await Promise.all([
        apiGetAuthorStats(),
        apiGetAuthorContent(),
      ]);
      setStats(statsData);
      setContent(contentData);
    } catch {}
    setLoading(false);
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await apiUpgradeToAuthor({
        bio,
        specializations: specializations.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setIsAuthor(true);
      loadData();
    } catch {}
    setUpgrading(false);
  };

  const handleUpload = async () => {
    if (!uploadTitle || !uploadUrl) {
      setUploadMsg('Заполните название и URL изображения');
      return;
    }
    setUploading(true);
    setUploadMsg('');
    try {
      await apiUploadContent({
        title: uploadTitle,
        description: uploadDesc,
        tags: uploadTags.split(',').map((t) => t.trim()).filter(Boolean),
        category: uploadCategory,
        imageUrl: uploadUrl,
        thumbnailUrl: uploadThumb || uploadUrl,
      });
      setUploadMsg('Контент загружен!');
      setUploadTitle('');
      setUploadDesc('');
      setUploadTags('');
      setUploadUrl('');
      setUploadThumb('');
      loadData();
    } catch (e: any) {
      setUploadMsg(e.message || 'Ошибка загрузки');
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить контент?')) return;
    try {
      await apiDeleteAuthorContent(id);
      setContent((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  if (!isAuthenticated || !user) return null;

  // ─── Not Author Yet ─────────────────────────────
  if (!isAuthor && !loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Станьте автором</h1>
          <p className="text-text-secondary max-w-md mx-auto">
            Загружайте свой контент на платформу и зарабатывайте на продажах. 
            Получайте доход с каждого скачивания.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: DollarSign, title: 'Доход', desc: 'До 70% от каждой продажи' },
            { icon: Eye, title: 'Охват', desc: 'Тысячи покупателей в СНГ' },
            { icon: TrendingUp, title: 'Рост', desc: 'Пассивный доход от контента' },
          ].map((f, i) => (
            <div key={i} className="bento-item p-5 text-center">
              <f.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
              <p className="text-xs text-text-muted">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bento-item p-6 max-w-lg mx-auto">
          <h2 className="text-lg font-semibold mb-4">Заявка на авторство</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">О себе</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Фотограф, дизайнер, иллюстратор..."
                className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary resize-none h-20"
              />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Специализации (через запятую)</label>
              <input
                type="text"
                value={specializations}
                onChange={(e) => setSpecializations(e.target.value)}
                placeholder="пейзажи, портреты, еда"
                className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {upgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
              {upgrading ? 'Отправка...' : 'Стать автором'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Author Dashboard ───────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Crown className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Кабинет автора</h1>
            <p className="text-sm text-text-muted">{user.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-border rounded-xl">
            <DollarSign className="w-4 h-4 text-accent-green" />
            <span className="font-bold">{stats?.totalEarnings || 0} ₽</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-dark-700 border border-border rounded-xl">
            <Package className="w-4 h-4 text-accent-blue" />
            <span className="font-bold">{stats?.totalContent || 0}</span>
            <span className="text-sm text-text-muted">файлов</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-4 mb-6 border-b border-border -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setUploadMsg(''); }}
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
              { label: 'Доход за все время', value: `${stats?.totalEarnings || 0}₽`, icon: DollarSign, color: 'text-accent-green' },
              { label: 'Просмотры', value: stats?.totalViews || 0, icon: Eye, color: 'text-accent-blue' },
              { label: 'Скачивания', value: stats?.totalDownloads || 0, icon: Download, color: 'text-primary' },
              { label: 'Контент', value: stats?.totalContent || 0, icon: Package, color: 'text-accent-yellow' },
            ].map((stat) => (
              <div key={stat.label} className="bento-item p-4">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="bento-item p-5">
            <h3 className="text-base font-semibold mb-4">Продажи за 7 дней</h3>
            <div className="flex items-end gap-2 h-32">
              {(stats?.dailySales || []).map((day: any, i: number) => {
                const maxEarnings = Math.max(...(stats?.dailySales || []).map((d: any) => d.earnings || 0), 1);
                const height = Math.max((day.earnings / maxEarnings) * 100, 4);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-text-muted">{day.earnings}₽</span>
                    <div
                      className="w-full bg-primary/80 rounded-t-lg transition-all"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-text-muted">{day.date.split('-')[2]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent sales */}
          <div className="bento-item p-5">
            <h3 className="text-base font-semibold mb-4">Последние продажи</h3>
            {(stats?.recentSales || []).length > 0 ? (
              <div className="space-y-2">
                {stats.recentSales.slice(0, 5).map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-accent-green" />
                      <span className="text-sm">{sale.contentTitle || 'Контент'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{sale.date?.split('T')[0]}</span>
                      <span className="text-sm font-bold text-accent-green">+{sale.amount}₽</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Пока нет продаж</p>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'content' && (
        <div>
          {content.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.map((item) => (
                <div key={item.id} className="bento-item group">
                  <div className="aspect-[4/3] overflow-hidden bg-dark-600 relative">
                    <img src={item.thumbnailUrl || item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium truncate">{item.title}</h3>
                    <div className="flex items-center justify-between mt-1.5 text-xs text-text-muted">
                      <span>{item.downloads || 0} скачиваний</span>
                      <span>{item.views || 0} просмотров</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-dark-500 mx-auto mb-3" />
              <p className="text-sm text-text-muted mb-3">Контента пока нет</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="text-sm text-primary hover:text-primary-light"
              >
                Загрузить первый файл
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload */}
      {activeTab === 'upload' && (
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold mb-4">Загрузка нового контента</h2>

          <div className="bento-item p-6 space-y-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Название *</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Красивый пейзаж на закате"
                className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-text-muted mb-1 block">Описание</label>
              <textarea
                value={uploadDesc}
                onChange={(e) => setUploadDesc(e.target.value)}
                placeholder="Описание изображения..."
                className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary resize-none h-20"
              />
            </div>

            <div>
              <label className="text-xs text-text-muted mb-1 block">URL изображения *</label>
              <input
                type="url"
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs text-text-muted mb-1 block">URL превью (миниатюра)</label>
              <input
                type="url"
                value={uploadThumb}
                onChange={(e) => setUploadThumb(e.target.value)}
                placeholder="Опционально, если отличается"
                className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Категория</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white appearance-none focus:outline-none focus:border-primary"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Теги (через запятую)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="пейзаж, закат"
                  className="w-full px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {uploadUrl && (
              <div>
                <label className="text-xs text-text-muted mb-1 block">Предпросмотр</label>
                <img src={uploadUrl} alt="Preview" className="w-full max-h-48 object-contain bg-dark-600 rounded-lg" />
              </div>
            )}

            {uploadMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                uploadMsg.includes('Ошибка') || uploadMsg.includes('Заполните')
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-accent-green/10 text-accent-green'
              }`}>
                {uploadMsg.includes('Ошибка') || uploadMsg.includes('Заполните')
                  ? <AlertCircle className="w-4 h-4 shrink-0" />
                  : <Check className="w-4 h-4 shrink-0" />}
                {uploadMsg}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !uploadTitle || !uploadUrl}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Загрузка...' : 'Загрузить контент'}
            </button>
          </div>
        </div>
      )}

      {/* Earnings */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bento-item p-5">
              <div className="text-xs text-text-muted mb-2">Всего заработано</div>
              <div className="text-3xl font-bold text-accent-green">{stats?.totalEarnings || 0}₽</div>
            </div>
            <div className="bento-item p-5">
              <div className="text-xs text-text-muted mb-2">За 30 дней</div>
              <div className="text-3xl font-bold">{stats?.recentEarnings || 0}₽</div>
            </div>
            <div className="bento-item p-5">
              <div className="text-xs text-text-muted mb-2">К выплате</div>
              <div className="text-3xl font-bold text-accent-yellow">{stats?.pendingPayout || 0}₽</div>
            </div>
          </div>

          <div className="bento-item p-5">
            <h3 className="text-base font-semibold mb-4">Модель выплат</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-dark-600 rounded-lg p-4">
                <h4 className="font-medium mb-2">Стандартный автор</h4>
                <p className="text-text-muted">50% от каждой продажи</p>
                <p className="text-text-muted">Выплаты от 1000₽</p>
              </div>
              <div className="bg-dark-600 rounded-lg p-4">
                <h4 className="font-medium mb-2">Премиум автор</h4>
                <p className="text-text-muted">70% от каждой продажи</p>
                <p className="text-text-muted">Выплаты от 500₽</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-lg space-y-6">
          <div className="bento-item p-5">
            <h3 className="text-base font-semibold mb-4">Информация автора</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Статус</span>
                <span className="text-accent-green font-medium">Автор</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Дата присоединения</span>
                <span>{user.createdAt?.split('T')[0] || 'Нет данных'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Роль</span>
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          <Link
            to="/upload"
            className="bento-item p-5 flex items-center gap-4 hover:border-primary transition-colors cursor-pointer block"
          >
            <Upload className="w-6 h-6 text-primary" />
            <div>
              <div className="text-sm font-medium">Загрузка файлов</div>
              <div className="text-xs text-text-muted">Загрузите изображение через drag&drop</div>
            </div>
            <ExternalLink className="w-4 h-4 text-text-muted ml-auto" />
          </Link>
        </div>
      )}
    </div>
  );
}
