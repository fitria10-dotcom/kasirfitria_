export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // Harga Jual
  costPrice: number; // Harga Modal
  stock: number;
  imageUrl?: string; // Image URL or Base64 data URI
  sku?: string;
  barcode?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  note?: string;
  discountPercent?: number;
}

export type PaymentMethod = 'cash' | 'qris' | 'debit' | 'transfer';

export interface TransactionItem {
  productId: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  quantity: number;
  subtotal: number;
  note?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  timestamp: number;
  cashierId: string;
  cashierName: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number; // nominal discount
  tax: number; // nominal tax (PPN)
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number; // kembalian
  customerName?: string;
}

export type CashierRole = 'admin' | 'supervisor' | 'cashier';

export interface CashierAccount {
  id: string;
  name: string;
  username: string;
  pin: string; // 4-6 digit numeric PIN
  role: CashierRole;
  avatar?: string;
  phone?: string;
  shift?: string;
  isActive: boolean;
  createdAt: number;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  address: string;
  phone: string;
  receiptFooter: string;
  taxRatePercent: number; // e.g. 0 or 11
  currencySymbol: string; // "Rp"
}
