import { Plus, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/store';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => onAdd(product)}
      className="group relative flex flex-col rounded-xl bg-card shadow-card border border-border overflow-hidden text-left transition-all hover:shadow-elevated hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <UtensilsCrossed className="h-10 w-10 text-muted-foreground/40" />
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1">
        <span className="font-semibold text-sm text-card-foreground truncate">{product.name}</span>
        <span className="text-xs text-muted-foreground">{product.category}</span>
        <span className="mt-auto font-bold text-primary text-base">
          R$ {product.price.toFixed(2)}
        </span>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="gradient-primary rounded-full p-1.5 text-primary-foreground">
          <Plus className="h-4 w-4" />
        </div>
      </div>
    </motion.button>
  );
}
