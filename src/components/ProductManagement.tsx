import React, { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  ArrowUpDown,
  TrendingUp,
} from 'lucide-react';
import { Product } from '../types';
import { compressImageFile, formatRupiah } from '../services/imageUtils';
import { ConfirmModal } from './ConfirmModal';

interface ProductManagementProps {
  products: Product[];
  onAddOrUpdateProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

// Quick sample image presets for fast selection
const PRESET_IMAGES = [
  { label: 'Nasi Goreng', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80' },
  { label: 'Ayam Goreng/Bakar', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80' },
  { label: 'Mie / Bakmi', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80' },
  { label: 'Kopi Susu', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80' },
  { label: 'Es Teh Segar', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80' },
  { label: 'Jus / Smoothie', url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80' },
  { label: 'Camilan / Fries', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80' },
  { label: 'Dimsum', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80' },
  { label: 'Roti / Pastry', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80' },
];

const TableProductThumbnail: React.FC<{ imageUrl?: string; name: string }> = ({ imageUrl, name }) => {
  const [hasError, setHasError] = useState(false);
  if (!imageUrl || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-1">
        <ImageIcon className="w-5 h-5 text-slate-300" />
        <span className="text-[9px] text-slate-400 mt-0.5">No Foto</span>
      </div>
    );
  }
  return (
    <img
      src={imageUrl}
      alt={name}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
      onError={() => setHasError(true)}
    />
  );
};

export const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  onAddOrUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Makanan');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');

  // Image states
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Makanan');
    setCustomCategory('');
    setPrice(0);
    setCostPrice(0);
    setStock(10);
    setSku(`PROD-${Math.floor(1000 + Math.random() * 9000)}`);
    setDescription('');
    setImageUrl('');
    setImageUrlInput('');
    setUploadError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category || 'Makanan');
    setCustomCategory('');
    setPrice(prod.price);
    setCostPrice(prod.costPrice || 0);
    setStock(prod.stock);
    setSku(prod.sku || '');
    setDescription(prod.description || '');
    setImageUrl(prod.imageUrl || '');
    setImageUrlInput(prod.imageUrl && !prod.imageUrl.startsWith('data:') ? prod.imageUrl : '');
    setUploadError('');
    setIsModalOpen(true);
  };

  // Handle local file upload with compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (JPG, PNG, WEBP)');
      return;
    }

    try {
      setIsCompressing(true);
      setUploadError('');
      // Compress to lightweight JPEG
      const compressedDataUrl = await compressImageFile(file, 800, 800, 0.85);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      setUploadError('Gagal memproses gambar. Coba gambar lain.');
      console.error(err);
    } finally {
      setIsCompressing(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [formError, setFormError] = useState<string>('');

  const handleApplyUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImageUrl(imageUrlInput.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Nama produk wajib diisi.');
      return;
    }
    setFormError('');

    const finalCategory = category === 'Lainnya' && customCategory.trim() ? customCategory.trim() : category;

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: name.trim(),
      category: finalCategory,
      price: Math.max(0, Number(price) || 0),
      costPrice: Math.max(0, Number(costPrice) || 0),
      stock: Math.max(0, Number(stock) || 0),
      sku: sku.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      createdAt: editingProduct ? editingProduct.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    await onAddOrUpdateProduct(productData);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, prodName: string) => {
    setDeleteTarget({ id, name: prodName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await onDeleteProduct(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 p-4 sm:p-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Katalog Produk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah foto produk, atur harga jual, harga modal, dan pantau ketersediaan stok menu.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/20 text-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm mb-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama produk, SKU..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Foto Produk</th>
                <th className="py-3 px-4">Nama & SKU</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harga Jual</th>
                <th className="py-3 px-4">Harga Modal</th>
                <th className="py-3 px-4">Margin Laba</th>
                <th className="py-3 px-4">Stok</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-medium text-slate-600">Tidak ada produk ditemukan</p>
                      <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau tambah produk baru.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const profit = p.price - (p.costPrice || 0);
                  const marginPercent = p.price > 0 ? Math.round((profit / p.price) * 100) : 0;

                  return (
                    <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                      {/* Product Photo Thumbnail */}
                      <td className="py-2.5 px-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative group">
                          <TableProductThumbnail imageUrl={p.imageUrl} name={p.name} />
                        </div>
                      </td>

                      {/* Name & SKU */}
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        {p.sku && <div className="text-[11px] font-mono text-slate-400">{p.sku}</div>}
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-4">
                        <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                          {p.category}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {formatRupiah(p.price)}
                      </td>

                      {/* Cost Price */}
                      <td className="py-2.5 px-4 text-slate-500">
                        {formatRupiah(p.costPrice || 0)}
                      </td>

                      {/* Profit Margin */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>{formatRupiah(profit)}</span>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded">
                            ({marginPercent}%)
                          </span>
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-2.5 px-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-md text-xs inline-block ${
                            p.stock <= 0
                              ? 'bg-rose-100 text-rose-700'
                              : p.stock <= 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stock <= 0 ? 'Habis (0)' : `${p.stock} pcs`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-100 transition-colors"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lengkapi foto dan informasi produk untuk kasir
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* IMAGE UPLOAD & PREVIEW SECTION */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Foto Produk (Pilih Upload File atau Input Link URL):
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Visual Preview */}
                  <div className="w-28 h-28 rounded-2xl bg-white border-2 border-dashed border-amber-300 overflow-hidden relative shrink-0 shadow-sm flex items-center justify-center group">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl('');
                            setImageUrlInput('');
                          }}
                          className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold"
                        >
                          Hapus Foto
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                        <ImageIcon className="w-7 h-7 text-amber-500/60 mb-1" />
                        <span className="text-[10px] leading-tight text-slate-500">
                          Pratinjau Foto
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 w-full space-y-2">
                    {/* Method Selector Tabs */}
                    <div className="flex items-center gap-1 border-b border-slate-200 pb-1.5">
                      <button
                        type="button"
                        onClick={() => setImageTab('upload')}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                          imageTab === 'upload'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah File (Dari Komputer / HP)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageTab('url')}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                          imageTab === 'url'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Input Link URL</span>
                      </button>
                    </div>

                    {/* Upload File Panel */}
                    {imageTab === 'upload' && (
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isCompressing}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-2.5 px-3 border border-slate-300 hover:border-amber-400 rounded-xl bg-white text-xs font-medium text-slate-700 hover:text-amber-800 flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <Upload className="w-4 h-4 text-amber-500" />
                          <span>
                            {isCompressing
                              ? 'Memproses gambar...'
                              : 'Klik untuk pilih foto dari galeri/folder'}
                          </span>
                        </button>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Mendukung JPG, PNG, WEBP. Otomatis dikompresi agar loading cepat.
                        </p>
                      </div>
                    )}

                    {/* Link URL Panel */}
                    {imageTab === 'url' && (
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                          className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={handleApplyUrl}
                          className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                        >
                          Terapkan
                        </button>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-[11px] text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {uploadError}
                      </p>
                    )}

                    {/* Quick Preset Selector */}
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-500 font-medium block mb-1">
                        Atau pilih contoh foto cepat:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {PRESET_IMAGES.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setImageUrl(preset.url);
                              setImageUrlInput(preset.url);
                            }}
                            className="text-[10px] bg-white hover:bg-amber-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRODUCT INFORMATION FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Produk <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Nasi Goreng Spesial Fitria"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Cemilan">Cemilan</option>
                    <option value="Paket">Paket</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Lainnya">+ Tambah Kategori Baru</option>
                  </select>
                  {category === 'Lainnya' && (
                    <input
                      type="text"
                      placeholder="Ketik kategori baru..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="mt-1.5 w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  )}
                </div>

                {/* SKU / Barcode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode SKU / Barcode
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Contoh: FOOD-009"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Jual (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={price || ''}
                    onChange={(e) => setPrice(Number(e.target.value) || 0)}
                    placeholder="25000"
                    className="w-full px-3 py-2 text-xs sm:text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Modal / HPP (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={costPrice || ''}
                    onChange={(e) => setCostPrice(Number(e.target.value) || 0)}
                    placeholder="15000"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Stok Tersedia
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock || ''}
                    onChange={(e) => setStock(Number(e.target.value) || 0)}
                    placeholder="50"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Keterangan Singkat
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Rincian rasa, porsi, atau bahan..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Form Error alert */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Footer buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'Simpan Perubahan' : 'Tambahkan Produk'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Product Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Produk?"
        message={`Apakah Anda yakin ingin menghapus produk "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Produk"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
