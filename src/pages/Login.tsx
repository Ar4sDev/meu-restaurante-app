import { useState } from 'react';
import { Flame, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const { isDark, toggle } = useTheme();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(user, pass)) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle isDark={isDark} toggle={toggle} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 border-4 border-orange-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
           👨‍🍳
            </div>
          <h1 className="text-3xl font-extrabold text-foreground">Delivery do Chef</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestão Inteligente para Delivery</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4">
          <div>
            <Label className="text-sm font-semibold">Usuário</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="Código do operador"
                className="pl-10"
                autoFocus
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold">Senha</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="••••••"
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-destructive text-sm font-medium text-center"
            >
              Usuário ou senha incorretos
            </motion.p>
          )}

          <Button type="submit" className="w-full gradient-primary text-primary-foreground font-bold h-11">
            Entrar
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
