import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Check, Zap, Copy, CheckCircle, ArrowLeft, Shield, Star
} from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Стартер',
    price: 1500,
    credits: 100,
    features: ['100 кредитов', 'Доступ к каталогу', 'ИИ-генерация (10/день)', 'Email-поддержка'],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Про',
    price: 3000,
    credits: 300,
    features: ['300 кредитов', 'Весь каталог + авторы', 'ИИ-генерация (50/день)', 'Приоритетная поддержка', 'Без водяных знаков'],
    popular: true,
  },
  {
    id: 'business',
    name: 'Бизнес',
    price: 7500,
    credits: 1000,
    features: ['1000 кредитов', 'Всё из «Про»', 'ИИ-генерация без лимита', 'API доступ', 'Персональный менеджер', 'Коммерческая лицензия'],
    popular: false,
  },
];

// ─── Настройте свой номер СБП ─────────────────────
const SBP_PHONE = '+79525080681';
// ───────────────────────────────────────────────────

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [step, setStep] = useState<'select' | 'pay' | 'confirm'>('select');
  const [copied, setCopied] = useState(false);
  const [txId, setTxId] = useState('');
  const [_submitted, setSubmitted] = useState(false);

  const handleSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setStep('pay');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    if (!txId.trim()) return;
    setSubmitted(true);
    setStep('confirm');
  };

  if (step === 'confirm' && selectedPlan) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-accent-green" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Заявка отправлена!</h1>
        <p className="text-text-secondary mb-2">
          Мы проверим платёж и зачислим <strong>{selectedPlan.credits} кредитов</strong> на ваш счёт.
        </p>
        <p className="text-sm text-text-muted mb-8">
          ID транзакции: <code className="bg-dark-700 px-2 py-0.5 rounded">{txId}</code>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="px-6 py-2.5 bg-dark-700 border border-border rounded-xl text-sm font-medium hover:bg-dark-600 transition-colors">
            В личный кабинет
          </Link>
          <button
            onClick={() => { setStep('select'); setSelectedPlan(null); setTxId(''); setSubmitted(false); }}
            className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-colors"
          >
            Купить ещё
          </button>
        </div>
      </div>
    );
  }

  if (step === 'pay' && selectedPlan) {
    const phoneDisplay = SBP_PHONE.replace(/(\+\d)(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3-$4-$5');

    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12">
        <button
          onClick={() => { setStep('select'); setSelectedPlan(null); }}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к тарифам
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Оплата тарифа «{selectedPlan.name}»</h1>
          <p className="text-text-secondary">
            Сумма: <span className="text-white font-bold text-lg">{selectedPlan.price.toLocaleString('ru-RU')} ₽</span>
          </p>
        </div>

        {/* Payment card */}
        <div className="bento-item p-6 mb-6">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Перевод через СБП
          </h3>

          <div className="bg-dark-600 rounded-xl p-5 mb-4 text-center">
            <p className="text-xs text-text-muted mb-3">Отсканируйте QR-код в приложении банка</p>
            <div className="inline-block p-3 bg-white rounded-2xl mb-4">
              <img src="/qr-sbp.jpg" alt="QR-код СБП" className="w-48 h-48" />
            </div>
            <div className="text-xs text-text-muted mb-3">или переведите по номеру</div>
            <div className="text-3xl font-bold font-mono tracking-wider mb-4">
              {phoneDisplay}
            </div>
            <button
              onClick={() => handleCopy(SBP_PHONE)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-sm text-primary font-medium transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Скопировано!' : 'Скопировать номер'}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between bg-dark-600 rounded-lg px-3 py-2.5">
              <span className="text-xs text-text-muted">Сумма</span>
              <code className="text-sm font-mono font-bold text-primary">{selectedPlan.price.toLocaleString('ru-RU')} ₽</code>
            </div>
            <div className="flex items-center justify-between bg-dark-600 rounded-lg px-3 py-2.5">
              <span className="text-xs text-text-muted">Комментарий</span>
              <code className="text-xs font-mono">{selectedPlan.name} - РуСток</code>
            </div>
          </div>

          <div className="mt-4 bg-dark-800 rounded-xl p-4">
            <p className="text-xs text-text-muted mb-2 font-medium">Как перевести:</p>
            <ol className="text-xs text-text-secondary space-y-1.5 list-decimal list-inside">
              <li>Откройте <strong className="text-white">Сбербанк Онлайн</strong></li>
              <li>Перейдите в <strong className="text-white">«Переводы» → «По номеру телефона»</strong></li>
              <li>Вставьте номер <code className="bg-dark-600 px-1 rounded">{phoneDisplay}</code></li>
              <li>Введите сумму <strong className="text-white">{selectedPlan.price.toLocaleString('ru-RU')} ₽</strong></li>
              <li>В комментарии напишите <code className="bg-dark-600 px-1 rounded">{selectedPlan.name}</code></li>
              <li>Подтвердите перевод</li>
            </ol>
          </div>
        </div>

        {/* Confirm payment */}
        <div className="bento-item p-5">
          <h3 className="text-sm font-semibold mb-3">Подтвердите оплату</h3>
          <p className="text-xs text-text-muted mb-3">
            После перевода введите последние 4 цифры суммы или ID транзакции из чека
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="Например: 3000 или a1b2c3"
              className="flex-1 px-3 py-2 bg-dark-600 border border-border rounded-lg text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleConfirm}
              disabled={!txId.trim()}
              className="px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Отправить
            </button>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center mt-4">
          <Shield className="w-3 h-3 inline mr-1" />
          Кредиты зачислятся в течение 5 минут после подтверждения оплаты
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-4">
          <Zap className="w-4 h-4" />
          Тарифы
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Выберите свой план</h1>
        <p className="text-text-secondary max-w-md mx-auto">
          Оплачивайте через СБП — быстро и без комиссий. Кредиты зачисляются мгновенно.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bento-item p-6 flex flex-col ${
              plan.popular ? 'border-primary/50 glow-red' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                <Star className="w-3 h-3" />
                Популярный
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{plan.price.toLocaleString('ru-RU')}₽</span>
                <span className="text-sm text-text-muted">/мес</span>
              </div>
              <p className="text-sm text-primary mt-1">{plan.credits} кредитов</p>
            </div>

            <ul className="space-y-2.5 mb-8 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <Check className="w-4 h-4 text-accent-green mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelect(plan)}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                plan.popular
                  ? 'bg-primary hover:bg-primary-dark text-white hover:shadow-lg hover:shadow-primary/20'
                  : 'bg-dark-600 hover:bg-dark-500 border border-border text-white'
              }`}
            >
              Оплатить через СБП
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-xs text-text-muted">
          <Shield className="w-3 h-3 inline mr-1" />
          Безопасная оплата через СБП · Нет комиссий для покупателя · Кредиты зачисляются после подтверждения
        </p>
      </div>
    </div>
  );
}
