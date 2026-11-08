import { Product, Transaction, CashierAccount, StoreSettings } from '../types';

const DB_NAME = 'FitriaKasirDB';
const DB_VERSION = 1;
const STORE_PRODUCTS = 'products';
const STORE_TRANSACTIONS = 'transactions';
const STORE_CASHIERS = 'cashiers';
const STORE_SETTINGS = 'settings';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Nasi Goreng Spesial Fitria',
    category: 'Makanan',
    price: 25000,
    costPrice: 15000,
    stock: 45,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    sku: 'FOOD-001',
    description: 'Nasi goreng dengan bumbu rempah khas, telur mata sapi, sate ayam, dan kerupuk renyah.',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'prod-2',
    name: 'Ayam Bakar Madu Pedas',
    category: 'Makanan',
    price: 32000,
    costPrice: 20000,
    stock: 28,
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
    sku: 'FOOD-002',
    description: 'Potongan ayam marinasi bumbu madu legit bakar dengan sambal terasi segar.',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'prod-3',
    name: 'Mie Goreng Seafood Jawa',
    category: 'Makanan',
    price: 28000,
    costPrice: 16000,
    stock: 35,
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
    sku: 'FOOD-003',
    description: 'Mie kuning kenyal dengan udang, cumi, sayuran segar dan racikan kecap manis gurih.',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'prod-4',
    name: 'Es Kopi Susu Gula Aren',
    category: 'Minuman',
    price: 18000,
    costPrice: 9000,
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    sku: 'BEV-001',
    description: 'Espresso arabika dipadukan susu segar creamy dan sirup gula aren asli organik.',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'prod-5',
    name: 'Es Teh Manis Jasmine',
    category: 'Minuman',
    price: 8000,
    costPrice: 2500,
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
    sku: 'BEV-002',
    description: 'Seduhan teh melati wangi dingin dengan es kristal dan gula murni menyegarkan.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'prod-6',
    name: 'Matcha Latte Dingin',
    category: 'Minuman',
    price: 22000,
    costPrice: 11000,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    sku: 'BEV-003',
    description: 'Bubuk matcha murni kualitas premium dengan susu oat/fresh milk lembut.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'prod-7',
    name: 'Kentang Goreng Truffle Crispy',
    category: 'Cemilan',
    price: 20000,
    costPrice: 10000,
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    sku: 'SNK-001',
    description: 'French fries renyah bertabur minyak truffle aromatik dan keju parmesan gurih.',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'prod-8',
    name: 'Dimsum Siomay Ayam Udang (4 Pcs)',
    category: 'Cemilan',
    price: 24000,
    costPrice: 13000,
    stock: 30,
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    sku: 'SNK-002',
    description: 'Siomay kukus hangat bertekstur kenyal padat isi ayam cincang dan udang segar + chili oil.',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'prod-9',
    name: 'Paket Hemat Makan Kenyang',
    category: 'Paket',
    price: 33000,
    costPrice: 18000,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    sku: 'PKT-001',
    description: 'Nasi Goreng Spesial + Es Teh Manis Jasmine hemat Rp 2.000.',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
  },
];

export const INITIAL_CASHIERS: CashierAccount[] = [
  {
    id: 'cashier-1',
    name: 'Fitria Oktafiani',
    username: 'fitria',
    pin: '1234',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '081234567890',
    shift: 'General / Owner',
    isActive: true,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'cashier-2',
    name: 'Budi Santoso',
    username: 'budi_pagi',
    pin: '1111',
    role: 'cashier',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '085612345678',
    shift: 'Shift Pagi (08:00 - 16:00)',
    isActive: true,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'cashier-3',
    name: 'Siti Rahmawati',
    username: 'siti_sore',
    pin: '2222',
    role: 'cashier',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    phone: '087798765432',
    shift: 'Shift Sore (16:00 - 23:00)',
    isActive: true,
    createdAt: Date.now() - 86400000 * 3,
  },
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Fitria Kasir POS',
  tagline: 'Solusi Kasir Praktis & Cepat',
  address: 'Jl. Pemuda No. 88, Jakarta Selatan',
  phone: '0812-3456-7890',
  receiptFooter: 'Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar.',
  taxRatePercent: 0,
  currencySymbol: 'Rp',
};

// In-memory fallback
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryCashiers: CashierAccount[] = [...INITIAL_CASHIERS];
let memoryTransactions: Transaction[] = [];
let memorySettings: StoreSettings = { ...INITIAL_SETTINGS };

// Safe helper for localStorage
function safeGetLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSetLocalStorage(key: string, value: any): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // ignore quota errors
  }
}

// Open IndexedDB database safely
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported'));
        return;
      }
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        try {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
            db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
            const transStore = db.createObjectStore(STORE_TRANSACTIONS, { keyPath: 'id' });
            transStore.createIndex('timestamp', 'timestamp', { unique: false });
            transStore.createIndex('cashierId', 'cashierId', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORE_CASHIERS)) {
            db.createObjectStore(STORE_CASHIERS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
            db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
          }
        } catch (e) {
          console.warn('onupgradeneeded error:', e);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
    } catch (e) {
      reject(e);
    }
  });
}

export const StorageService = {
  async init(): Promise<void> {
    try {
      const db = await openDB();
      const products = await this.getProducts();
      if (products.length === 0) {
        await this.saveProducts(INITIAL_PRODUCTS);
      }
      const cashiers = await this.getCashiers();
      if (cashiers.length === 0) {
        await this.saveCashiers(INITIAL_CASHIERS);
      }
      const settings = await this.getSettings();
      if (!settings) {
        await this.saveSettings(INITIAL_SETTINGS);
      }
    } catch (err) {
      // Fallback cleanly to localStorage and in-memory
      const localProds = safeGetLocalStorage<Product[]>(STORE_PRODUCTS, []);
      if (localProds.length > 0) {
        memoryProducts = localProds;
      } else {
        safeSetLocalStorage(STORE_PRODUCTS, INITIAL_PRODUCTS);
      }

      const localCashiers = safeGetLocalStorage<CashierAccount[]>(STORE_CASHIERS, []);
      if (localCashiers.length > 0) {
        memoryCashiers = localCashiers;
      } else {
        safeSetLocalStorage(STORE_CASHIERS, INITIAL_CASHIERS);
      }

      const localSettings = safeGetLocalStorage<StoreSettings>(STORE_SETTINGS, INITIAL_SETTINGS);
      memorySettings = localSettings;
    }
  },

  async getProducts(): Promise<Product[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_PRODUCTS, 'readonly');
          const store = tx.objectStore(STORE_PRODUCTS);
          const req = store.getAll();
          req.onsuccess = () => {
            const res = req.result || [];
            if (res.length > 0) {
              memoryProducts = res;
              resolve(res);
            } else {
              const fallback = safeGetLocalStorage(STORE_PRODUCTS, memoryProducts);
              resolve(fallback.length > 0 ? fallback : INITIAL_PRODUCTS);
            }
          };
          req.onerror = () => {
            resolve(safeGetLocalStorage(STORE_PRODUCTS, memoryProducts));
          };
        } catch {
          resolve(safeGetLocalStorage(STORE_PRODUCTS, memoryProducts));
        }
      });
    } catch {
      return safeGetLocalStorage(STORE_PRODUCTS, memoryProducts);
    }
  },

  async saveProducts(products: Product[]): Promise<void> {
    memoryProducts = [...products];
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = tx.objectStore(STORE_PRODUCTS);
      store.clear();
      for (const p of products) {
        store.put(p);
      }
    } catch {
      // ignore
    }
    safeSetLocalStorage(STORE_PRODUCTS, products);
  },

  async addOrUpdateProduct(product: Product): Promise<void> {
    const products = await this.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      products[idx] = product;
    } else {
      products.unshift(product);
    }
    await this.saveProducts(products);
  },

  async deleteProduct(id: string): Promise<void> {
    const products = await this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    await this.saveProducts(filtered);
  },

  async getCashiers(): Promise<CashierAccount[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_CASHIERS, 'readonly');
          const store = tx.objectStore(STORE_CASHIERS);
          const req = store.getAll();
          req.onsuccess = () => {
            const res = req.result || [];
            if (res.length > 0) {
              memoryCashiers = res;
              resolve(res);
            } else {
              resolve(safeGetLocalStorage(STORE_CASHIERS, memoryCashiers));
            }
          };
          req.onerror = () => {
            resolve(safeGetLocalStorage(STORE_CASHIERS, memoryCashiers));
          };
        } catch {
          resolve(safeGetLocalStorage(STORE_CASHIERS, memoryCashiers));
        }
      });
    } catch {
      return safeGetLocalStorage(STORE_CASHIERS, memoryCashiers);
    }
  },

  async saveCashiers(cashiers: CashierAccount[]): Promise<void> {
    memoryCashiers = [...cashiers];
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_CASHIERS, 'readwrite');
      const store = tx.objectStore(STORE_CASHIERS);
      store.clear();
      for (const c of cashiers) {
        store.put(c);
      }
    } catch {
      // ignore
    }
    safeSetLocalStorage(STORE_CASHIERS, cashiers);
  },

  async addOrUpdateCashier(cashier: CashierAccount): Promise<void> {
    const cashiers = await this.getCashiers();
    const idx = cashiers.findIndex((c) => c.id === cashier.id);
    if (idx >= 0) {
      cashiers[idx] = cashier;
    } else {
      cashiers.push(cashier);
    }
    await this.saveCashiers(cashiers);
  },

  async deleteCashier(id: string): Promise<void> {
    const cashiers = await this.getCashiers();
    const filtered = cashiers.filter((c) => c.id !== id);
    await this.saveCashiers(filtered);
  },

  async getTransactions(): Promise<Transaction[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_TRANSACTIONS, 'readonly');
          const store = tx.objectStore(STORE_TRANSACTIONS);
          const req = store.getAll();
          req.onsuccess = () => {
            const list: Transaction[] = req.result || [];
            list.sort((a, b) => b.timestamp - a.timestamp);
            memoryTransactions = list;
            resolve(list);
          };
          req.onerror = () => {
            resolve(safeGetLocalStorage(STORE_TRANSACTIONS, memoryTransactions));
          };
        } catch {
          resolve(safeGetLocalStorage(STORE_TRANSACTIONS, memoryTransactions));
        }
      });
    } catch {
      return safeGetLocalStorage(STORE_TRANSACTIONS, memoryTransactions);
    }
  },

  async saveTransaction(transaction: Transaction): Promise<void> {
    memoryTransactions = [transaction, ...memoryTransactions];
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_TRANSACTIONS, 'readwrite');
      const store = tx.objectStore(STORE_TRANSACTIONS);
      store.put(transaction);
    } catch {
      // ignore
    }
    safeSetLocalStorage(STORE_TRANSACTIONS, memoryTransactions.slice(0, 100));
  },

  async getSettings(): Promise<StoreSettings> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_SETTINGS, 'readonly');
          const store = tx.objectStore(STORE_SETTINGS);
          const req = store.get('current');
          req.onsuccess = () => {
            const res = req.result?.data || INITIAL_SETTINGS;
            memorySettings = res;
            resolve(res);
          };
          req.onerror = () => {
            resolve(safeGetLocalStorage(STORE_SETTINGS, memorySettings));
          };
        } catch {
          resolve(safeGetLocalStorage(STORE_SETTINGS, memorySettings));
        }
      });
    } catch {
      return safeGetLocalStorage(STORE_SETTINGS, memorySettings);
    }
  },

  async saveSettings(settings: StoreSettings): Promise<void> {
    memorySettings = { ...settings };
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = tx.objectStore(STORE_SETTINGS);
      store.put({ key: 'current', data: settings });
    } catch {
      // ignore
    }
    safeSetLocalStorage(STORE_SETTINGS, settings);
  },

  async exportBackup(): Promise<string> {
    const products = await this.getProducts();
    const cashiers = await this.getCashiers();
    const transactions = await this.getTransactions();
    const settings = await this.getSettings();
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        storeName: settings.storeName,
        products,
        cashiers,
        transactions,
        settings,
      },
      null,
      2
    );
  },

  async importBackup(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data.products)) {
        await this.saveProducts(data.products);
      }
      if (Array.isArray(data.cashiers)) {
        await this.saveCashiers(data.cashiers);
      }
      if (Array.isArray(data.transactions)) {
        try {
          const db = await openDB();
          const tx = db.transaction(STORE_TRANSACTIONS, 'readwrite');
          const store = tx.objectStore(STORE_TRANSACTIONS);
          store.clear();
          for (const t of data.transactions) {
            store.put(t);
          }
        } catch {
          // ignore
        }
        memoryTransactions = data.transactions;
        safeSetLocalStorage(STORE_TRANSACTIONS, data.transactions.slice(0, 100));
      }
      if (data.settings) {
        await this.saveSettings(data.settings);
      }
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  },
};
