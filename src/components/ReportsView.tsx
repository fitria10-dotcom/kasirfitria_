import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Receipt,
  Users,
  Calendar,
  Filter,
  Eye,
  ShoppingBag,
  ArrowUpRight,
  Download,
  Package,
} from 'lucide-react';
import { Transaction, CashierAccount } from '../types';
import { formatRupiah, formatDateTime } from '../services/imageUtils';

interface ReportsViewProps {
  transactions: Transaction[];
  cashiers: CashierAccount[];
  onViewReceipt: (transaction: Transaction) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  cashiers,
  onViewReceipt,
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | 'all'>('all');
  const [selectedCashierId, setSelectedCashierId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter transactions based on date and cashier
  const filteredTransactions = useMemo(() => {
    const now = Date.now();
    const oneDay = 86400000;

    return transactions.filter((t) => {
      // Cashier filter
      if (selectedCashierId !== 'all' && t.cashierId !== selectedCashierId) {
        return false;
      }

      // Time filter
      if (timeFilter === 'today') {
        const transDate = new Date(t.timestamp).toDateString();
        const todayDate = new Date().toDateString();
        if (transDate !== todayDate) return false;
      } else if (timeFilter === '7days') {
        if (now - t.timestamp > 7 * oneDay) return false;
      } else if (timeFilter === '30days') {
        if (now - t.timestamp > 30 * oneDay) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchInvoice = t.invoiceNumber.toLowerCase().includes(term);
        const matchCashier = t.cashierName.toLowerCase().includes(term);
        const matchCustomer = t.customerName?.toLowerCase().includes(term);
        const matchItem = t.items.some((i) => i.name.toLowerCase().includes(term));
        if (!matchInvoice && !matchCashier && !matchCustomer && !matchItem) return false;
      }

      return true;
    });
  }, [transactions, selectedCashierId, timeFilter, searchTerm]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalOmzet = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const count = filteredTransactions.length;
    const avgOrderValue = count > 0 ? Math.round(totalOmzet / count) : 0;

    // Calculate total net profit
    let totalProfit = 0;
    filteredTransactions.forEach((t) => {
      t.items.forEach((item) => {
        const profitPerItem = item.price - (item.costPrice || 0);
        totalProfit += profitPerItem * item.quantity;
      });
      // Deduct discount from profit
      totalProfit -= t.discount;
    });

    return {
      totalOmzet,
      count,
      avgOrderValue,
      totalProfit: Math.max(0, totalProfit),
    };
  }, [filteredTransactions]);

  // Top Selling Products ranking
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; category: string; quantity: number; revenue: number }>();

    filteredTransactions.forEach((t) => {
      t.items.forEach((item) => {
        const existing = map.get(item.productId) || {
          name: item.name,
          category: item.category,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
        map.set(item.productId, existing);
      });
    });

    const list = Array.from(map.values());
    list.sort((a, b) => b.quantity - a.quantity);
    return list.slice(0, 5);
  }, [filteredTransactions]);

  const [exportNotice, setExportNotice] = useState<string>('');

  // Export CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      setExportNotice('Tidak ada transaksi untuk diekspor pada filter aktif.');
      setTimeout(() => setExportNotice(''), 4000);
      return;
    }
    setExportNotice('');

    const headers = ['No Invoice', 'Waktu', 'Kasir', 'Pelanggan', 'Metode Bayar', 'Subtotal', 'Diskon', 'Pajak', 'Total'];
    const rows = filteredTransactions.map((t) => [
      t.invoiceNumber,
      `"${new Date(t.timestamp).toLocaleString('id-ID')}"`,
      `"${t.cashierName}"`,
      `"${t.customerName || '-'}"`,
      t.paymentMethod.toUpperCase(),
      t.subtotal,
      t.discount,
      t.tax,
      t.total,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan-kasir-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 p-4 sm:p-6 space-y-6">
      {/* Top Title and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Laporan Penjualan & Riwayat Kasir
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis omset harian, kinerja akun kasir, dan riwayat transaksi penjualan.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Ekspor Laporan (CSV)</span>
        </button>
      </div>

      {exportNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold rounded-2xl">
          {exportNotice}
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Time Tabs */}
        <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {[
            { key: 'today', label: 'Hari Ini' },
            { key: '7days', label: '7 Hari Terakhir' },
            { key: '30days', label: '30 Hari' },
            { key: 'all', label: 'Semua Waktu' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setTimeFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                timeFilter === tab.key
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* Cashier Filter Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCashierId}
              onChange={(e) => setSelectedCashierId(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">Semua Kasir</option>
              {cashiers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari invoice, item..."
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Omzet */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Pendapatan (Omzet)</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {formatRupiah(metrics.totalOmzet)}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
              ● Berdasarkan filter aktif
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Jumlah Transaksi</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {metrics.count} Struk
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">
              Pesanan selesai
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Laba Bersih */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Estimasi Laba Bersih</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
              {formatRupiah(metrics.totalProfit)}
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold mt-1 inline-block">
              Harga Jual - Harga Modal
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Rata-rata per Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Rata-rata Nilai Pesanan</span>
            <div className="text-xl sm:text-2xl font-black text-purple-700 mt-1">
              {formatRupiah(metrics.avgOrderValue)}
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">
              Per transaksi pelanggan
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TOP SELLING PRODUCTS SECTION */}
      {topProducts.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Produk Paling Laris</h3>
            </div>
            <span className="text-xs text-slate-400">Top 5 Menu Terfavorit</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topProducts.map((prod, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.2 rounded">
                      {prod.category}
                    </span>
                  </div>
                  <h5 className="font-semibold text-xs text-slate-900 line-clamp-1">{prod.name}</h5>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-xs font-black text-amber-700">{prod.quantity} Terjual</span>
                  <span className="text-[10px] text-slate-500">{formatRupiah(prod.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Daftar Riwayat Transaksi</h3>
            <p className="text-xs text-slate-500">
              Total {filteredTransactions.length} transaksi tercatat di sistem
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">No. Invoice</th>
                <th className="py-3 px-4">Kasir yang Melayani</th>
                <th className="py-3 px-4">Rincian Menu</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada riwayat transaksi pada rentang waktu ini.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    {/* Time */}
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateTime(t.timestamp)}
                    </td>

                    {/* Invoice */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {t.invoiceNumber}
                    </td>

                    {/* Cashier Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-medium text-slate-800">{t.cashierName}</span>
                      </div>
                      {t.customerName && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Pelanggan: {t.customerName}
                        </span>
                      )}
                    </td>

                    {/* Items Summary */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="truncate text-slate-700">
                        {t.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                      </div>
                    </td>

                    {/* Method */}
                    <td className="py-3 px-4">
                      <span className="inline-block bg-slate-100 text-slate-700 uppercase font-semibold text-[10px] px-2 py-0.5 rounded">
                        {t.paymentMethod}
                      </span>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {formatRupiah(t.total)}
                    </td>

                    {/* Action: View & Print Receipt */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onViewReceipt(t)}
                        className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
                        title="Lihat Struk Transaksi"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Struk</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
