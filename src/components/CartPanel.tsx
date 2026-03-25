import { useState } from 'react';
import { Minus, Plus, Trash2, CreditCard, ShoppingCart, Banknote, QrCode, X, Printer, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CartItem, Customer, PaymentMethod, Sale } from '@/lib/store';

const paymentLabels: Record<PaymentMethod, string> = {
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
  pix: 'Pix',
  cash: 'Dinheiro',
};

interface CartPanelProps {
  items: CartItem[];
  customer: Customer;
  observations: string;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onCustomerChange: (customer: Customer) => void;
  onObservationsChange: (obs: string) => void;
  onFinalize: (method: PaymentMethod, changeFor?: number) => Sale;
}

export function CartPanel({ items, customer, observations, onUpdateQty, onRemove, onCustomerChange, onObservationsChange, onFinalize }: CartPanelProps) {
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [changeFor, setChangeFor] = useState('');
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const handleFinalize = () => {
    if (!selectedMethod || items.length === 0) return;
    const sale = onFinalize(selectedMethod, selectedMethod === 'cash' && changeFor ? parseFloat(changeFor) : undefined);
    setReceipt(sale);
    setSelectedMethod(null);
    setChangeFor('');
  };

  const closeReceipt = () => setReceipt(null);

  return (
    <>
      <div className="flex flex-col h-full bg-card border-l border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-lg flex items-center gap-2 text-card-foreground">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Carrinho
            {items.length > 0 && (
              <span className="gradient-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence>
            {items.length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-8">Carrinho vazio</p>
            )}
            {items.map(item => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 bg-muted/50 rounded-lg p-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-card-foreground">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    R$ {item.product.price.toFixed(2)} × {item.quantity} = <span className="font-semibold text-card-foreground">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onUpdateQty(item.product.id, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-bold w-5 text-center text-card-foreground">{item.quantity}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onUpdateQty(item.product.id, 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onRemove(item.product.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="border-t border-border p-3 space-y-3 overflow-y-auto max-h-[55%]">
          {/* Customer */}
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Cliente</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Nome</Label>
              <Input value={customer.name} onChange={e => onCustomerChange({ ...customer, name: e.target.value })} placeholder="Nome" className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Telefone</Label>
              <Input value={customer.phone} onChange={e => onCustomerChange({ ...customer, phone: e.target.value })} placeholder="(00) 00000-0000" className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Rua</Label>
              <Input value={customer.street} onChange={e => onCustomerChange({ ...customer, street: e.target.value })} placeholder="Rua..." className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Número</Label>
              <Input value={customer.number} onChange={e => onCustomerChange({ ...customer, number: e.target.value })} placeholder="Nº" className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Bairro</Label>
              <Input value={customer.neighborhood} onChange={e => onCustomerChange({ ...customer, neighborhood: e.target.value })} placeholder="Bairro" className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">Complemento</Label>
              <Input value={customer.complement} onChange={e => onCustomerChange({ ...customer, complement: e.target.value })} placeholder="Apt, Bloco..." className="h-8 text-xs" />
            </div>
          </div>

          {/* Observations */}
          <div>
            <Label className="text-xs">Observações do Pedido</Label>
            <Textarea
              value={observations}
              onChange={e => onObservationsChange(e.target.value)}
              placeholder="Sem cebola, enviar talheres, tocar interfone..."
              className="text-xs min-h-[50px] resize-none"
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total</span>
            <motion.span
              key={total}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              className="text-xl font-extrabold text-primary"
            >
              R$ {total.toFixed(2)}
            </motion.span>
          </div>

          {/* Payment */}
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide">Pagamento</h3>
          <div className="grid grid-cols-2 gap-2">
            {([
              { method: 'credit' as const, icon: CreditCard, label: 'Crédito' },
              { method: 'debit' as const, icon: CreditCard, label: 'Débito' },
              { method: 'pix' as const, icon: QrCode, label: 'Pix' },
              { method: 'cash' as const, icon: Banknote, label: 'Dinheiro' },
            ]).map(({ method, icon: Icon, label }) => (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                  selectedMethod === method
                    ? 'gradient-primary text-primary-foreground border-transparent'
                    : 'border-border text-card-foreground hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selectedMethod === 'cash' && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                <Label className="text-xs">Troco para quanto? (opcional)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={changeFor}
                  onChange={e => setChangeFor(e.target.value)}
                  placeholder="R$ 0,00"
                  className="h-8 text-xs"
                />
                {changeFor && parseFloat(changeFor) > total && (
                  <p className="text-xs text-success font-semibold mt-1">
                    Troco: R$ {(parseFloat(changeFor) - total).toFixed(2)}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleFinalize}
            disabled={items.length === 0 || !selectedMethod}
            className="w-full gradient-primary text-primary-foreground font-bold text-sm h-10 gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Finalizar Pedido
          </Button>
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {receipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4"
            onClick={closeReceipt}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-elevated max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="gradient-primary p-4 rounded-t-2xl flex items-center justify-between">
                <h2 className="text-primary-foreground font-bold text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Pedido Finalizado
                </h2>
                <Button size="icon" variant="ghost" onClick={closeReceipt} className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 space-y-4 text-sm">
                <div className="text-xs text-muted-foreground">
                  {new Date(receipt.date).toLocaleString('pt-BR')} — #{receipt.id.slice(0, 8)}
                </div>

                {/* Items */}
                <div className="space-y-1">
                  <h4 className="font-semibold text-card-foreground text-xs uppercase tracking-wide">Itens</h4>
                  {receipt.items.map(item => (
                    <div key={item.product.id} className="flex justify-between text-card-foreground">
                      <span>{item.quantity}× {item.product.name}</span>
                      <span className="font-medium">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-2 flex justify-between font-bold text-primary text-base">
                  <span>Total</span>
                  <span>R$ {receipt.total.toFixed(2)}</span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">Pagamento: </span>
                  <span className="font-semibold text-card-foreground">{paymentLabels[receipt.paymentMethod]}</span>
                  {receipt.paymentMethod === 'cash' && receipt.changeFor && receipt.changeFor > receipt.total && (
                    <span className="ml-2 text-success font-semibold">
                      (Troco: R$ {(receipt.changeFor - receipt.total).toFixed(2)})
                    </span>
                  )}
                </div>

                {/* Customer */}
                {receipt.customer.name && (
                  <div className="space-y-1">
                    <h4 className="font-semibold text-card-foreground text-xs uppercase tracking-wide">Cliente</h4>
                    <p className="text-card-foreground">{receipt.customer.name}</p>
                    {receipt.customer.phone && <p className="text-muted-foreground text-xs">{receipt.customer.phone}</p>}
                    {receipt.customer.street && (
                      <p className="text-muted-foreground text-xs">
                        {receipt.customer.street}, {receipt.customer.number}
                        {receipt.customer.neighborhood && ` — ${receipt.customer.neighborhood}`}
                        {receipt.customer.complement && ` (${receipt.customer.complement})`}
                      </p>
                    )}
                  </div>
                )}

                {receipt.observations && (
                  <div>
                    <h4 className="font-semibold text-card-foreground text-xs uppercase tracking-wide">Observações</h4>
                    <p className="text-muted-foreground text-xs bg-muted/50 rounded-lg p-2 mt-1">{receipt.observations}</p>
                  </div>
                )}

                <Button onClick={closeReceipt} className="w-full gradient-primary text-primary-foreground font-semibold gap-2">
                  <Printer className="h-4 w-4" />
                  Fechar Recibo
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
