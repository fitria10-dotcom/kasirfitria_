import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  FileText,
  ShoppingBag,
  Percent,
  Receipt,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { Product, CartItem, StoreSettings } from '../types';
import { formatRupiah } from '../services/imageUtils';
import { ConfirmModal } from './ConfirmModal';

interface PosViewProps {
  products: Product[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  settings: StoreSettings;
  onProceedToPayment: (subtotal: number, discount: number, tax: number, total: number, customerName: string) => void;
  onOpenAddProduct: () => void;
}

const ProductCardImage: React.FC<{ imageUrl?: string; name: string }> = ({ imageUrl, name }) => {
  const [hasError, setHasError] = useState(false);

  if (!imageUrl || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-amber-50 text-slate-400 p-2 text-center">
        <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center mb-1">
          <ImageIcon className="w-5 h-5" />
        </div>
        <span className="text-[10px] text-slate-500 font-medium line-clamp-1">
          Belum ada foto
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
};

export const PosView: React.FC<PosViewProps> = ({
  products,
  cart,
  setCart,
  settings,
  onProceedToPayment,
  onOpenAddProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [discountType, setDiscountType] = useState<'percent' | 'nominal'>('nominal');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [applyTax, setApplyTax] = useState<boolean>(settings.taxRatePercent > 0);
  const [customerName, setCustomerName] = useState<string>('');
  const [editingNoteItem, setEditingNoteItem] = useState<{ id: string; note: string } | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['Semua', ...Array.from(set)];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  // Add to cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // max stock
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, note: '' }];
    });
  };

  // Modify cart item quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const clearCart = () => {
    if (cart.length === 0) return;
    setIsResetConfirmOpen(true);
  };

  const handleConfirmClearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setCustomerName('');
    setIsResetConfirmOpen(false);
  };

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (subtotal <= 0) return 0;
    if (discountType === 'percent') {
      return Math.round((subtotal * Math.min(100, Math.max(0, discountValue))) / 100);
    }
    return Math.min(subtotal, Math.max(0, discountValue));
  }, [subtotal, discountType, discountValue]);

  const taxAmount = useMemo(() => {
    if (!applyTax || settings.taxRatePercent <= 0) return 0;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return Math.round((taxableAmount * settings.taxRatePercent) / 100);
  }, [subtotal, discountAmount, applyTax, settings.taxRatePercent]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Handle note save
  const handleSaveNote = () => {
    if (!editingNoteItem) return;
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === editingNoteItem.id ? { ...item, note: editingNoteItem.note } : item
      )
    );
    setEditingNoteItem(null);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
      {/* LEFT: Product Catalog */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-5 border-r border-slate-200">
        {/* Top Controls: Search and Categories */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari produk berdasarkan nama, kode SKU..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={onOpenAddProduct}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-xl shadow transition-all shrink-0"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Tambah Produk</span>
              <span className="sm:hidden">Produk</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count =
                cat === 'Semua'
                  ? products.length
                  : products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-amber-600 text-slate-950' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-2">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm">Produk Tidak Ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Tidak ada produk dengan kata kunci "{searchTerm}" di kategori {selectedCategory}.
              </p>
              <button
                onClick={onOpenAddProduct}
                className="mt-3 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Produk Baru
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-20 lg:pb-4">
              {filteredProducts.map((product) => {
                const cartItem = cart.find((i) => i.product.id === product.id);
                const isOutOfStock = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && addToCart(product)}
                    className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer select-none ${
                      cartItem
                        ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                        : 'border-slate-200/80 hover:border-amber-300 hover:shadow-lg'
                    } ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.98]'}`}
                  >
                    {/* PRODUCT IMAGE SECTION */}
                    <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                      <ProductCardImage imageUrl={product.imageUrl} name={product.name} />

                      {/* Category Badge */}
                      <span className="absolute top-2 left-2 bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                        {product.category || 'Umum'}
                      </span>

                      {/* Stock Badge */}
                      <span
                        className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm ${
                          isOutOfStock
                            ? 'bg-rose-500 text-white'
                            : product.stock <= 5
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-500/90 text-white backdrop-blur-sm'
                        }`}
                      >
                        {isOutOfStock ? 'Habis' : `Stok: ${product.stock}`}
                      </span>

                      {/* If in cart, show quantity badge */}
                      {cartItem && (
                        <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[1px] flex items-center justify-center">
                          <div className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 scale-110">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{cartItem.quantity} di keranjang</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors">
                          {product.name}
                        </h4>
                        {product.sku && (
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                            {product.sku}
                          </span>
                        )}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 block leading-tight">Harga</span>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {formatRupiah(product.price)}
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isOutOfStock) addToCart(product);
                          }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${
                            isOutOfStock
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-amber-500 hover:bg-amber-600 active:scale-90 text-slate-950 shadow-sm'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart / Order Summary Panel (Desktop Sidebar) */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 shadow-lg">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Pesanan Aktif</h2>
              <p className="text-[11px] text-slate-500">{totalCartCount} item di keranjang</p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              title="Reset Keranjang"
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Customer Name Input (Optional) */}
        <div className="px-4 py-2 bg-amber-50/50 border-b border-amber-100/80 flex items-center gap-2">
          <span className="text-[11px] font-medium text-amber-900 shrink-0">Pelanggan:</span>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nama Pemesan (opsional)"
            className="flex-1 bg-white border border-amber-200/80 rounded-md px-2 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[42vh] lg:max-h-none">
          {cart.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <ShoppingBag className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-xs font-medium text-slate-500">Keranjang masih kosong</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pilih menu di sebelah kiri untuk menambahkan ke pesanan
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-2.5 transition-all hover:border-slate-300"
              >
                {/* Product thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden shrink-0 relative">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-xs text-slate-900 truncate">
                    {item.product.name}
                  </h5>
                  <p className="text-[11px] text-amber-700 font-bold">
                    {formatRupiah(item.product.price)}
                  </p>

                  {/* Notes info or button */}
                  {item.note ? (
                    <p
                      onClick={() => setEditingNoteItem({ id: item.product.id, note: item.note || '' })}
                      className="text-[10px] text-slate-500 italic truncate bg-white px-1.5 py-0.5 rounded border border-slate-200 inline-block max-w-[140px] cursor-pointer hover:border-amber-400 mt-0.5"
                    >
                      "{item.note}"
                    </p>
                  ) : (
                    <button
                      onClick={() => setEditingNoteItem({ id: item.product.id, note: '' })}
                      className="text-[10px] text-slate-400 hover:text-amber-600 flex items-center gap-0.5 mt-0.5"
                    >
                      <FileText className="w-2.5 h-2.5" /> + Catatan
                    </button>
                  )}
                </div>

                {/* Quantity adjusters */}
                <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Calculation / Discount / Tax / Pay Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          {/* Discount & Tax Accordion / Inputs */}
          <div className="space-y-2 text-xs">
            {/* Subtotal */}
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({totalCartCount} item)</span>
              <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
            </div>

            {/* Discount selector */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Percent className="w-3.5 h-3.5 text-amber-600" />
                <span>Diskon:</span>
                <div className="inline-flex rounded-md border border-slate-200 bg-white text-[10px]">
                  <button
                    type="button"
                    onClick={() => setDiscountType('nominal')}
                    className={`px-1.5 py-0.5 rounded-l-md ${
                      discountType === 'nominal' ? 'bg-amber-500 font-bold text-slate-950' : ''
                    }`}
                  >
                    Rp
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('percent')}
                    className={`px-1.5 py-0.5 rounded-r-md ${
                      discountType === 'percent' ? 'bg-amber-500 font-bold text-slate-950' : ''
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 px-2 py-0.5 bg-white border border-slate-300 rounded text-right text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                {discountAmount > 0 && (
                  <span className="text-rose-600 font-semibold text-[11px]">
                    -{formatRupiah(discountAmount)}
                  </span>
                )}
              </div>
            </div>

            {/* Tax / PPN Toggle */}
            <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyTax}
                  onChange={(e) => setApplyTax(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Pajak (PPN {settings.taxRatePercent}%)</span>
              </label>
              <span className="font-medium text-slate-700">
                {applyTax ? formatRupiah(taxAmount) : 'Rp 0'}
              </span>
            </div>

            {/* Total Grand Total */}
            <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
              <span className="font-bold text-sm text-slate-900">Total Pembayaran</span>
              <span className="font-black text-xl text-amber-600">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Action Button: Pay Now */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => onProceedToPayment(subtotal, discountAmount, taxAmount, total, customerName)}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <Receipt className="w-5 h-5 text-slate-950" />
            <span>Bayar Sekarang ({formatRupiah(total)})</span>
          </button>
        </div>
      </div>

      {/* Note modal */}
      {editingNoteItem && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-2">Catatan Pesanan</h3>
            <p className="text-xs text-slate-500 mb-3">
              Tambahkan preferensi khusus (misal: "tanpa es", "kurangi gula", "pedas level 2").
            </p>
            <textarea
              rows={3}
              value={editingNoteItem.note}
              onChange={(e) =>
                setEditingNoteItem({ ...editingNoteItem, note: e.target.value })
              }
              placeholder="Tulis catatan..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditingNoteItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 text-xs bg-amber-500 text-slate-950 font-semibold rounded-lg hover:bg-amber-600"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Clear Cart Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Kosongkan Keranjang?"
        message="Semua daftar item pesanan yang sudah dipilih akan dihapus dari keranjang."
        confirmLabel="Ya, Kosongkan"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmClearCart}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
