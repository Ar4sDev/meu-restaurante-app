import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProductCard } from '@/components/ProductCard';
import { CartPanel } from '@/components/CartPanel';
import { getProducts, saveSale } from '@/lib/store';
import type { CartItem, Customer, PaymentMethod, Product, Sale } from '@/lib/store';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const emptyCustomer: Customer = { name: '', phone: '', street: '', number: '', neighborhood: '', complement: '' };

export default function Sales() {
  const [products] = useState(getProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [observations, setObservations] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => [...new Set(products.map(p => p.category))], [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory) list = list.filter(p => p.category === activeCategory);
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [products, activeCategory, search]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product.id !== productId) return i;
      const newQty = i.quantity + delta;
      return newQty <= 0 ? i : { ...i, quantity: newQty };
    }));
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  const finalize = (method: PaymentMethod, changeFor?: number): Sale => {
    const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const sale = saveSale({ items: cart, customer, paymentMethod: method, total, observations, changeFor });
    setCart([]);
    setCustomer(emptyCustomer);
    setObservations('');
    toast({
      title: '✅ Venda finalizada!',
      description: `Total: R$ ${total.toFixed(2)}`,
    });
    return sale;
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." className="pl-10" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                !activeCategory ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Todos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0">
          <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" layout>
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </motion.div>
        </div>
      </div>

      <div className="w-80 xl:w-96 flex-shrink-0 hidden md:flex">
        <CartPanel
          items={cart}
          customer={customer}
          observations={observations}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onCustomerChange={setCustomer}
          onObservationsChange={setObservations}
          onFinalize={finalize}
        />
      </div>
    </div>
  );
}
