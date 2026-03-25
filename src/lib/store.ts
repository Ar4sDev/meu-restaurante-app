export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  name: string;
  phone: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
}

export type PaymentMethod = 'credit' | 'debit' | 'pix' | 'cash';

export interface Sale {
  id: string;
  items: CartItem[];
  customer: Customer;
  paymentMethod: PaymentMethod;
  total: number;
  date: string;
  observations: string;
  changeFor?: number;
  cancelled?: boolean;
}

export interface CashMovement {
  id: string;
  type: 'sangria' | 'suprimento';
  amount: number;
  description: string;
  date: string;
}

const PRODUCTS_KEY = 'pdv_products';
const SALES_KEY = 'pdv_sales';
const MOVEMENTS_KEY = 'pdv_cash_movements';

const defaultProducts: Product[] = [
  { id: '1', name: 'X-Burger', price: 22.90, image: '', category: 'Lanches' },
  { id: '2', name: 'X-Salada', price: 25.90, image: '', category: 'Lanches' },
  { id: '3', name: 'X-Bacon', price: 28.90, image: '', category: 'Lanches' },
  { id: '4', name: 'Hot Dog', price: 15.90, image: '', category: 'Lanches' },
  { id: '5', name: 'Coca-Cola 350ml', price: 6.00, image: '', category: 'Bebidas' },
  { id: '6', name: 'Suco Natural', price: 8.00, image: '', category: 'Bebidas' },
  { id: '7', name: 'Água Mineral', price: 3.50, image: '', category: 'Bebidas' },
  { id: '8', name: 'Batata Frita', price: 12.00, image: '', category: 'Acompanhamentos' },
  { id: '9', name: 'Onion Rings', price: 14.00, image: '', category: 'Acompanhamentos' },
  { id: '10', name: 'Milk Shake', price: 16.00, image: '', category: 'Sobremesas' },
];

export function getProducts(): Product[] {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
  return defaultProducts;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Omit<Product, 'id'>): Product {
  const products = getProducts();
  const newProduct = { ...product, id: crypto.randomUUID() };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): void {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx !== -1) {
    products[idx] = { ...products[idx], ...updates };
    saveProducts(products);
  }
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

export function getSales(): Sale[] {
  const stored = localStorage.getItem(SALES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveSale(sale: Omit<Sale, 'id' | 'date'>): Sale {
  const sales = getSales();
  const newSale: Sale = {
    ...sale,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  sales.push(newSale);
  localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  return newSale;
}

export function cancelSale(id: string): void {
  const sales = getSales();
  const idx = sales.findIndex(s => s.id === id);
  if (idx !== -1) {
    sales[idx].cancelled = true;
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }
}

export function getCashMovements(): CashMovement[] {
  const stored = localStorage.getItem(MOVEMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addCashMovement(movement: Omit<CashMovement, 'id' | 'date'>): CashMovement {
  const movements = getCashMovements();
  const newMovement: CashMovement = {
    ...movement,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  };
  movements.push(newMovement);
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
  return newMovement;
}
