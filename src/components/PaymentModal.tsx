import React, { useState, useEffect } from 'react';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PaymentMethod, CashierAccount } from '../types';
import { formatRupiah } from '../services/imageUtils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  customerName: string;
  activeCashier: CashierAccount | null;
  onConfirmPayment: (paymentMethod: PaymentMethod, amountPaid: number, change: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  discount,
  tax,
  total,
  customerName,
  activeCashier,
  onConfirmPayment,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [quickAmountSelected, setQuickAmountSelected] = useState<number | null>(null);

  // Set default cash amount when modal opens or total changes
  useEffect(() => {
    if (isOpen) {
      setMethod('cash');
      setAmountPaidInput(total.toString());
      setQuickAmountSelected(total);
    }
  }, [isOpen, total]);

  if (!isOpen) return null;

  const numericPaid = Number(amountPaidInput) || 0;
  const change = Math.max(0, numericPaid - total);
  const isCashInsufficient = method === 'cash' && numericPaid < total;

  // Preset quick cash denominations
  const quickCashOptions = [
    { label: 'Uang Pas', value: total },
    { label: 'Rp 10.000', value: 10000 },
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 200.000', value: 200000 },
    { label: 'Rp 500.000', value: 500000 },
  ].filter((opt) => opt.value >= total || opt.label === 'Uang Pas');

  const handleSelectQuickCash = (val: number) => {
    setQuickAmountSelected(val);
    setAmountPaidInput(val.toString());
  };

  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleComplete = () => {
    if (method === 'cash') {
      if (isCashInsufficient) {
        setErrorMsg('Jumlah uang tunai yang diterima kurang dari total belanja.');
        return;
      }
      setErrorMsg('');
      onConfirmPayment('cash', numericPaid, change);
    } else {
      // Non-cash is exact amount
      setErrorMsg('');
      onConfirmPayment(method, total, 0);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Pembayaran Pesanan</h3>
            <p className="text-xs text-slate-500">
              Kasir: <span className="font-semibold text-slate-800">{activeCashier?.name || 'Kasir'}</span>
              {customerName ? ` • Pelanggan: ${customerName}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Display */}
        <div className="my-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-900 font-medium block">Total yang Harus Dibayar:</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-700">{formatRupiah(total)}</div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Subtotal: {formatRupiah(subtotal)}</div>
            {discount > 0 && <div className="text-rose-600">Diskon: -{formatRupiah(discount)}</div>}
            {tax > 0 && <div>Pajak: {formatRupiah(tax)}</div>}
          </div>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMethod('cash')}
            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
              method === 'cash'
                ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Banknote className="w-5 h-5" />
            <span>Tunai</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('qris')}
            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
              method === 'qris'
                ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span>QRIS</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('debit')}
            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
              method === 'debit'
                ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Debit / EDC</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('transfer')}
            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
              method === 'transfer'
                ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>Transfer</span>
          </button>
        </div>

        {/* Content based on method */}
        {method === 'cash' && (
          <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Uang Tunai Diterima (Rp):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  value={amountPaidInput}
                  onChange={(e) => {
                    setAmountPaidInput(e.target.value);
                    setQuickAmountSelected(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-base sm:text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Quick cash pills */}
            <div>
              <span className="text-[11px] text-slate-500 font-medium block mb-1.5">
                Pilihan Cepat Nominal Uang:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickCashOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleSelectQuickCash(opt.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      quickAmountSelected === opt.value
                        ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Change / Kembalian Calculation */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500">Kembalian:</span>
                <div
                  className={`text-xl sm:text-2xl font-black ${
                    isCashInsufficient ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {isCashInsufficient ? 'Uang Kurang' : formatRupiah(change)}
                </div>
              </div>
              {!isCashInsufficient && (
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>
        )}

        {method === 'qris' && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-slate-600 mb-2">Scan QRIS untuk Membayar</span>
            <div className="w-48 h-48 bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center">
              {/* QR Mockup */}
              <div className="w-full h-full bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-white rounded">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30
                          ? 'bg-slate-900'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded shadow">
                    QRIS POS
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-900 mt-3">Nominal: {formatRupiah(total)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mendukung GoPay, OVO, Dana, ShopeePay, BCA, Livin, dll.
            </p>
          </div>
        )}

        {method === 'debit' && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-semibold text-slate-700 block">
              Gesek / Masukkan Kartu ke Mesin EDC
            </span>
            <div className="flex gap-2">
              <span className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-blue-700">
                BCA
              </span>
              <span className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-yellow-600">
                Mandiri
              </span>
              <span className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-blue-900">
                BRI
              </span>
              <span className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-orange-600">
                BNI
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Pastikan struk EDC telah keluar dan transaksi berhasil dengan nominal{' '}
              <span className="font-bold text-slate-900">{formatRupiah(total)}</span>.
            </p>
          </div>
        )}

        {method === 'transfer' && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <span className="font-semibold text-slate-700 block">Transfer ke Rekening Toko:</span>
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Bank:</span>
                <span className="font-bold text-slate-900">BCA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. Rekening:</span>
                <span className="font-bold text-slate-900">8820-1928-3341</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Atas Nama:</span>
                <span className="font-bold text-slate-900">FITRIA OKTAFIANI</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Cek mutasi bank sebelum menyelesaikan transaksi ini.
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isCashInsufficient}
            onClick={handleComplete}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <span>Selesaikan & Cetak Struk</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
