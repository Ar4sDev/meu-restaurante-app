import { useMemo, useState } from 'react';
import { DollarSign, CreditCard, QrCode, Banknote, TrendingUp, ShoppingBag, BarChart3, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { getSales, getCashMovements, addCashMovement } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import type { PaymentMethod } from '@/lib/store';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const paymentConfig: Record<PaymentMethod, { label: string; icon: typeof CreditCard; gradient: string }> = {
  credit: { label: 'Crédito', icon: CreditCard, gradient: 'from-primary to-accent' },
  debit: { label: 'Débito', icon: CreditCard, gradient: 'from-secondary to-primary' },
  pix: { label: 'Pix', icon: QrCode, gradient: 'from-emerald-500 to-teal-500' },
  cash: { label: 'Dinheiro', icon: Banknote, gradient: 'from-amber-500 to-orange-500' },
};

export default function Dashboard() {
  const { cashOpenAmount } = useAuth();
  const [version, setVersion] = useState(0);
  const [movementType, setMovementType] = useState<'sangria' | 'suprimento' | null>(null);
  const [movAmount, setMovAmount] = useState('');
  const [movDesc, setMovDesc] = useState('');

  const sales = getSales();
  const movements = useMemo(() => getCashMovements(), [version]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.date).toDateString() === today && !s.cancelled);
    const totalToday = todaySales.reduce((s, sale) => s + sale.total, 0);
    const ticketMedio = todaySales.length > 0 ? totalToday / todaySales.length : 0;

    const byMethod: Record<PaymentMethod, number> = { credit: 0, debit: 0, pix: 0, cash: 0 };
    todaySales.forEach(sale => { byMethod[sale.paymentMethod] += sale.total; });

    const todayMovements = movements.filter(m => new Date(m.date).toDateString() === today);
    const totalSangrias = todayMovements.filter(m => m.type === 'sangria').reduce((s, m) => s + m.amount, 0);
    const totalSuprimentos = todayMovements.filter(m => m.type === 'suprimento').reduce((s, m) => s + m.amount, 0);

    return {
      totalToday,
      totalWithCash: cashOpenAmount + totalToday + totalSuprimentos - totalSangrias,
      orderCount: todaySales.length,
      ticketMedio,
      byMethod,
      cashOpenAmount,
      totalSangrias,
      totalSuprimentos,
      todayMovements,
    };
  }, [sales, cashOpenAmount, movements]);

  const handleMovement = () => {
    if (!movementType || !movAmount || parseFloat(movAmount) <= 0) return;
    addCashMovement({ type: movementType, amount: parseFloat(movAmount), description: movDesc });
    toast({ title: movementType === 'sangria' ? '💸 Sangria registrada!' : '💰 Suprimento registrado!' });
    setMovementType(null);
    setMovAmount('');
    setMovDesc('');
    setVersion(v => v + 1);
  };

  const summaryCards = [
    { label: 'Vendas Hoje', value: `R$ ${stats.totalToday.toFixed(2)}`, icon: DollarSign, gradient: 'gradient-primary' },
    { label: 'Pedidos', value: stats.orderCount.toString(), icon: ShoppingBag, gradient: 'gradient-warm' },
    { label: 'Ticket Médio', value: `R$ ${stats.ticketMedio.toFixed(2)}`, icon: TrendingUp, gradient: 'gradient-primary' },
    { label: 'Caixa Total', value: `R$ ${stats.totalWithCash.toFixed(2)}`, icon: BarChart3, gradient: 'gradient-warm' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        Dashboard Financeiro
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${card.gradient} rounded-2xl p-4 text-primary-foreground shadow-elevated`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary-foreground/20 rounded-lg p-1.5">
                <card.icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold opacity-90">{card.label}</span>
            </div>
            <p className="text-2xl font-extrabold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Cash Movements */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-5">
        <h2 className="font-bold text-card-foreground mb-4">Movimentação de Caixa</h2>
        <div className="flex gap-2 mb-4">
          <Button
            variant={movementType === 'sangria' ? 'default' : 'outline'}
            className={movementType === 'sangria' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            onClick={() => setMovementType(movementType === 'sangria' ? null : 'sangria')}
          >
            <ArrowDownCircle className="h-4 w-4 mr-1" /> Sangria
          </Button>
          <Button
            variant={movementType === 'suprimento' ? 'default' : 'outline'}
            className={movementType === 'suprimento' ? 'gradient-primary text-primary-foreground' : ''}
            onClick={() => setMovementType(movementType === 'suprimento' ? null : 'suprimento')}
          >
            <ArrowUpCircle className="h-4 w-4 mr-1" /> Suprimento
          </Button>
        </div>

        {movementType && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 mb-4">
            <div>
              <Label className="text-xs">Valor (R$)</Label>
              <Input type="number" step="0.01" value={movAmount} onChange={e => setMovAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <Label className="text-xs">Motivo / Descrição</Label>
              <Textarea value={movDesc} onChange={e => setMovDesc(e.target.value)} placeholder={movementType === 'sangria' ? 'Ex: Pagamento de fornecedor' : 'Ex: Reforço de troco'} className="min-h-[60px]" />
            </div>
            <Button onClick={handleMovement} className={movementType === 'sangria' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'gradient-primary text-primary-foreground'}>
              Confirmar {movementType === 'sangria' ? 'Sangria' : 'Suprimento'}
            </Button>
          </motion.div>
        )}

        {stats.todayMovements.length > 0 && (
          <div className="space-y-1 mt-2">
            {stats.todayMovements.map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  {m.type === 'sangria' ? <ArrowDownCircle className="h-3.5 w-3.5 text-destructive" /> : <ArrowUpCircle className="h-3.5 w-3.5 text-primary" />}
                  <span className="text-card-foreground">{m.description || (m.type === 'sangria' ? 'Sangria' : 'Suprimento')}</span>
                </div>
                <span className={`font-bold ${m.type === 'sangria' ? 'text-destructive' : 'text-primary'}`}>
                  {m.type === 'sangria' ? '-' : '+'}R$ {m.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Breakdown */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-5">
        <h2 className="font-bold text-card-foreground mb-4">Vendas por Método de Pagamento</h2>
        <div className="space-y-3">
          {(Object.keys(stats.byMethod) as PaymentMethod[]).map(method => {
            const config = paymentConfig[method];
            const amount = stats.byMethod[method];
            const percentage = stats.totalToday > 0 ? (amount / stats.totalToday) * 100 : 0;
            const Icon = config.icon;

            return (
              <div key={method}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-medium text-card-foreground">{config.label}</span>
                  </div>
                  <span className="text-sm font-bold text-card-foreground">R$ {amount.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cash Info */}
      {cashOpenAmount > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-card p-5">
          <h2 className="font-bold text-card-foreground mb-2">Informações do Caixa</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Abertura</p>
              <p className="font-bold text-card-foreground">R$ {cashOpenAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Vendas</p>
              <p className="font-bold text-primary">R$ {stats.totalToday.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Suprimentos</p>
              <p className="font-bold text-primary">+ R$ {stats.totalSuprimentos.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Sangrias</p>
              <p className="font-bold text-destructive">- R$ {stats.totalSangrias.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total em Caixa</p>
              <p className="font-bold text-card-foreground">R$ {stats.totalWithCash.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
