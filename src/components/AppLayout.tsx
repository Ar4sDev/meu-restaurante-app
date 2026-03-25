import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, Flame, Receipt, BarChart3, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Vendas', path: '/', icon: ShoppingCart },
  { label: 'Histórico', path: '/historico', icon: Receipt },
  { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
  { label: 'Estoque', path: '/admin', icon: Package },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isDark, toggle } = useTheme();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
  {/* A Laranja (Círculo Laranja) */}
  <div className="w-8 h-8 border-2 border-orange-500 rounded-full flex items-center justify-center text-base">
    👨‍🍳
  </div>
  
  {/* O Nome do Restaurante */}
  <div className="flex flex-col ml-1">
    <span className="text-orange-600 font-extrabold leading-none text-sm uppercase">Delivery</span>
    <span className="text-foreground font-bold leading-none text-xs">do Chef</span>
  </div>
</div>
        </div>

        <nav className="flex gap-1 ml-6 overflow-x-auto">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  active
                    ? 'gradient-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle isDark={isDark} toggle={toggle} />
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
