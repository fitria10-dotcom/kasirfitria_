import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PosView } from './components/PosView';
import { ProductManagement } from './components/ProductManagement';
import { CashierManagement } from './components/CashierManagement';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { CashierLoginModal } from './components/CashierLoginModal';
import { EditCashierNameModal } from './components/EditCashierNameModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  Product,
  CartItem,
  Transaction,
  CashierAccount,
  StoreSettings,
  PaymentMethod,
} from './types';
import {
  StorageService,
  INITIAL_PRODUCTS,
  INITIAL_CASHIERS,
  INITIAL_SETTINGS,
} from './services/storage';
import { generateInvoiceNumber } from './services/imageUtils';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'pos' | 'products' | 'cashiers' | 'reports' | 'settings'>('pos');

  // Application Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [cashiers, setCashiers] = useState<CashierAccount[]>([]);
  const [activeCashier, setActiveCashier] = useState<CashierAccount | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentBreakdown, setPaymentBreakdown] = useState({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
    customerName: '',
  });

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null);

  const [isSwitchCashierModalOpen, setIsSwitchCashierModalOpen] = useState(false);
  const [isEditCashierNameModalOpen, setIsEditCashierNameModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };
  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize DB on boot
  useEffect(() => {
    async function loadData() {
      try {
        await StorageService.init();

        const [prods, cashList, transList, savedSettings] = await Promise.all([
          StorageService.getProducts(),
          StorageService.getCashiers(),
          StorageService.getTransactions(),
          StorageService.getSettings(),
        ]);

        setProducts(prods);
        setCashiers(cashList);
        setTransactions(transList);
        setSettings(savedSettings);

        // Restore active cashier
        const savedCashierId = localStorage.getItem('activeCashierId');
        const matched = cashList.find((c) => c.id === savedCashierId);
        if (matched) {
          setActiveCashier(matched);
        } else if (cashList.length > 0) {
          setActiveCashier(cashList[0]);
          localStorage.setItem('activeCashierId', cashList[0].id);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handlers for Products
  const handleAddOrUpdateProduct = async (product: Product) => {
    await StorageService.addOrUpdateProduct(product);
    const updated = await StorageService.getProducts();
    setProducts(updated);

    // If product is in cart, update details
    setCart((prev) =>
      prev.map((item) => (item.product.id === product.id ? { ...item, product } : item))
    );
  };

  const handleDeleteProduct = async (id: string) => {
    await StorageService.deleteProduct(id);
    const updated = await StorageService.getProducts();
    setProducts(updated);
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  // Handlers for Cashiers
  const handleAddOrUpdateCashier = async (cashier: CashierAccount) => {
    await StorageService.addOrUpdateCashier(cashier);
    const updated = await StorageService.getCashiers();
    setCashiers(updated);

    // If the active cashier was modified, sync activeCashier
    if (activeCashier?.id === cashier.id) {
      setActiveCashier(cashier);
    }
  };

  const handleDeleteCashier = async (id: string) => {
    await StorageService.deleteCashier(id);
    const updated = await StorageService.getCashiers();
    setCashiers(updated);
    if (activeCashier?.id === id && updated.length > 0) {
      setActiveCashier(updated[0]);
      localStorage.setItem('activeCashierId', updated[0].id);
    }
  };

  const handleSetActiveCashier = (cashier: CashierAccount) => {
    setActiveCashier(cashier);
    localStorage.setItem('activeCashierId', cashier.id);
  };

  // Payment Flow
  const handleProceedToPayment = (
    subtotal: number,
    discount: number,
    tax: number,
    total: number,
    customerName: string
  ) => {
    setPaymentBreakdown({
      subtotal,
      discount,
      tax,
      total,
      customerName,
    });
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (
    paymentMethod: PaymentMethod,
    amountPaid: number,
    change: number
  ) => {
    if (!activeCashier) return;

    // Build transaction record
    const invoiceNumber = generateInvoiceNumber();
    const newTransaction: Transaction = {
      id: `trx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invoiceNumber,
      timestamp: Date.now(),
      cashierId: activeCashier.id,
      cashierName: activeCashier.name,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        costPrice: item.product.costPrice || 0,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
        note: item.note,
      })),
      subtotal: paymentBreakdown.subtotal,
      discount: paymentBreakdown.discount,
      tax: paymentBreakdown.tax,
      total: paymentBreakdown.total,
      paymentMethod,
      amountPaid,
      change,
      customerName: paymentBreakdown.customerName || undefined,
    };

    // Deduct stock in products
    const updatedProducts = products.map((prod) => {
      const soldItem = cart.find((i) => i.product.id === prod.id);
      if (soldItem) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - soldItem.quantity),
          updatedAt: Date.now(),
        };
      }
      return prod;
    });

    // Save to storage
    await StorageService.saveTransaction(newTransaction);
    await StorageService.saveProducts(updatedProducts);

    // Update state
    setTransactions((prev) => [newTransaction, ...prev]);
    setProducts(updatedProducts);
    setCart([]);
    setIsPaymentModalOpen(false);

    // Open receipt
    setActiveReceipt(newTransaction);
    setIsReceiptModalOpen(true);
  };

  const handleSaveSettings = async (newSettings: StoreSettings) => {
    await StorageService.saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleDataReset = async () => {
    await StorageService.saveProducts(INITIAL_PRODUCTS);
    await StorageService.saveCashiers(INITIAL_CASHIERS);
    await StorageService.saveSettings(INITIAL_SETTINGS);
    setProducts(INITIAL_PRODUCTS);
    setCashiers(INITIAL_CASHIERS);
    setSettings(INITIAL_SETTINGS);
    setActiveCashier(INITIAL_CASHIERS[0]);
    localStorage.setItem('activeCashierId', INITIAL_CASHIERS[0].id);
    setCart([]);
    showToast('Data berhasil di-reset ke pengaturan awal.', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center animate-pulse mb-4 shadow-xl shadow-amber-500/30">
          <span className="text-slate-950 font-black text-xl">FK</span>
        </div>
        <h2 className="font-bold text-lg">Memuat Fitria Kasir POS...</h2>
        <p className="text-xs text-slate-400 mt-1">Menyiapkan database lokal dan katalog foto produk</p>
      </div>
    );
  }

  const totalCartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
      {/* Top Header & Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeCashier={activeCashier}
        onOpenSwitchCashier={() => setIsSwitchCashierModalOpen(true)}
        onOpenEditCashierName={() => setIsEditCashierNameModalOpen(true)}
        settings={settings}
        cartItemCount={totalCartCount}
      />

      {/* Main View Router */}
      <main className="flex-1 flex overflow-hidden">
        {currentTab === 'pos' && (
          <PosView
            products={products}
            cart={cart}
            setCart={setCart}
            settings={settings}
            onProceedToPayment={handleProceedToPayment}
            onOpenAddProduct={() => setCurrentTab('products')}
          />
        )}

        {currentTab === 'products' && (
          <ProductManagement
            products={products}
            onAddOrUpdateProduct={handleAddOrUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {currentTab === 'cashiers' && (
          <CashierManagement
            cashiers={cashiers}
            activeCashier={activeCashier}
            transactions={transactions}
            onAddOrUpdateCashier={handleAddOrUpdateCashier}
            onDeleteCashier={handleDeleteCashier}
            onSetActiveCashier={handleSetActiveCashier}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            cashiers={cashiers}
            onViewReceipt={(trx) => {
              setActiveReceipt(trx);
              setIsReceiptModalOpen(true);
            }}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onDataReset={handleDataReset}
          />
        )}
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        subtotal={paymentBreakdown.subtotal}
        discount={paymentBreakdown.discount}
        tax={paymentBreakdown.tax}
        total={paymentBreakdown.total}
        customerName={paymentBreakdown.customerName}
        activeCashier={activeCashier}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Thermal Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        transaction={activeReceipt}
        settings={settings}
        onNewTransaction={() => {
          setIsReceiptModalOpen(false);
          setCurrentTab('pos');
        }}
      />

      {/* Quick Cashier Switcher / PIN Modal */}
      <CashierLoginModal
        isOpen={isSwitchCashierModalOpen}
        onClose={() => setIsSwitchCashierModalOpen(false)}
        cashiers={cashiers}
        activeCashier={activeCashier}
        onSwitchCashier={handleSetActiveCashier}
        onOpenAddCashier={() => {
          setIsSwitchCashierModalOpen(false);
          setCurrentTab('cashiers');
        }}
      />

      {/* Edit Cashier Name Modal */}
      <EditCashierNameModal
        isOpen={isEditCashierNameModalOpen}
        onClose={() => setIsEditCashierNameModalOpen(false)}
        cashier={activeCashier}
        onSave={async (updated) => {
          await handleAddOrUpdateCashier(updated);
          showToast(`Nama kasir berhasil diperbarui menjadi "${updated.name}"`, 'success');
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
