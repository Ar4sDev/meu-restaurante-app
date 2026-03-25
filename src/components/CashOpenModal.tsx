import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

export function CashOpenModal() {
  const { openCash } = useAuth();
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openCash(parseFloat(amount) || 0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl shadow-elevated max-w-sm w-full overflow-hidden"
      >
        <div className="gradient-primary p-5 text-center">
          <div className="bg-primary-foreground/20 rounded-full p-3 w-14 h-14 mx-auto mb-3 flex items-center justify-center">
            <DollarSign className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="text-primary-foreground font-bold text-xl">Abertura de Caixa</h2>
          <p className="text-primary-foreground/80 text-sm mt-1">Informe o valor inicial em caixa</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label className="text-sm font-semibold">Valor Inicial (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="100,00"
              className="text-lg font-bold text-center h-12 mt-1"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            {[50, 100, 200].map(v => (
              <Button
                key={v}
                type="button"
                variant="outline"
                className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => setAmount(v.toString())}
              >
                R$ {v}
              </Button>
            ))}
          </div>

          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-bold h-11">
            Abrir Caixa
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
