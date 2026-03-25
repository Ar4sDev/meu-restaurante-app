import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, Save, X, UtensilsCrossed, ImagePlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/store';
import type { Product } from '@/lib/store';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductForm {
  name: string;
  price: string;
  category: string;
  image: string;
}

const emptyForm: ProductForm = { name: '', price: '', category: '', image: '' };

export default function Admin() {
  const [products, setProducts] = useState(getProducts);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [isAdding, setIsAdding] = useState(false);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({ name: product.name, price: product.price.toString(), category: product.category, image: product.image });
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm(emptyForm);
  };

  const cancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm(emptyForm);
  };

  const saveEdit = () => {
    if (!form.name || !form.price) return;
    if (editingId) {
      updateProduct(editingId, { name: form.name, price: parseFloat(form.price), category: form.category, image: form.image });
      toast({ title: '✅ Produto atualizado!' });
    }
    setProducts(getProducts());
    cancel();
  };

  const saveNew = () => {
    if (!form.name || !form.price) return;
    addProduct({ name: form.name, price: parseFloat(form.price), category: form.category || 'Geral', image: form.image });
    setProducts(getProducts());
    toast({ title: '✅ Produto adicionado!' });
    cancel();
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setProducts(getProducts());
    toast({ title: '🗑️ Produto removido!' });
  };

  const FormFields = ({ onSave }: { onSave: () => void }) => (
    <div className="space-y-3 p-4 bg-muted/50 rounded-xl border border-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Nome</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do produto" />
        </div>
        <div>
          <Label className="text-xs">Preço (R$)</Label>
          <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
        </div>
        <div>
          <Label className="text-xs">Categoria</Label>
          <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ex: Lanches" />
        </div>
        <div>
          <Label className="text-xs">Imagem</Label>
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm text-muted-foreground hover:bg-muted transition">
                <ImagePlus className="h-4 w-4" />
                {form.image ? 'Trocar imagem' : 'Upload'}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={cancel}><X className="h-4 w-4 mr-1" /> Cancelar</Button>
        <Button size="sm" onClick={onSave} className="gradient-primary text-primary-foreground"><Save className="h-4 w-4 mr-1" /> Salvar</Button>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-extrabold text-foreground">Gestão de Estoque</h1>
        <Button onClick={startAdd} className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." className="pl-10" />
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <FormFields onSave={saveNew} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map(product => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
            >
              {editingId === product.id ? (
                <FormFields onSave={saveEdit} />
              ) : (
                <div className={`flex items-center gap-4 p-3 ${(!product.image || product.price === 0) ? 'ring-2 ring-destructive/50 rounded-xl' : ''}`}>
                  <div className={`h-14 w-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${!product.image ? 'bg-destructive/10 border-2 border-dashed border-destructive/40' : 'bg-muted'}`}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <UtensilsCrossed className="h-6 w-6 text-destructive/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-card-foreground truncate">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                      {(!product.image || product.price === 0) && (
                        <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                          {!product.image && product.price === 0 ? 'SEM IMAGEM • PREÇO ZERO' : !product.image ? 'SEM IMAGEM' : 'PREÇO ZERO'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`font-bold whitespace-nowrap ${product.price === 0 ? 'text-destructive' : 'text-primary'}`}>R$ {product.price.toFixed(2)}</span>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
