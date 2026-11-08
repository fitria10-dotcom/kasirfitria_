import React, { useState } from 'react';
import {
  Store,
  Receipt,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  HardDrive,
  Info,
} from 'lucide-react';
import { StoreSettings } from '../types';
import { StorageService } from '../services/storage';
import { ConfirmModal } from './ConfirmModal';

interface SettingsViewProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => Promise<void>;
  onDataReset: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onDataReset,
}) => {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [taxRatePercent, setTaxRatePercent] = useState<number>(settings.taxRatePercent);
  const [isSaved, setIsSaved] = useState(false);
  const [importMessage, setImportMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreSettings = {
      storeName: storeName.trim() || 'Fitria Kasir POS',
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      receiptFooter: receiptFooter.trim(),
      taxRatePercent: Math.max(0, Number(taxRatePercent) || 0),
      currencySymbol: 'Rp',
    };

    await onSaveSettings(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExport = async () => {
    const jsonStr = await StorageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup-fitria-kasir-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result as string;
        const success = await StorageService.importBackup(text);
        if (success) {
          setImportMessage('Data backup berhasil diimpor!');
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          setImportMessage('Gagal mengimpor file. Format tidak sesuai.');
        }
      } catch {
        setImportMessage('Terjadi kesalahan saat membaca file backup.');
      }
    };
    reader.readAsText(file);
  };

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleConfirmReset = async () => {
    setIsResetConfirmOpen(false);
    await onDataReset();
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pengaturan Toko & Kasir</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Sesuaikan identitas toko pada struk belanja, tarif pajak, dan pencadangan data lokal.
        </p>
      </div>

      {/* Store Info Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-4">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Identitas Toko & Struk</h3>
            <p className="text-xs text-slate-500">Informasi ini akan dicetak pada kepala struk belanja</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Toko / Usaha</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tagline / Slogan</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Contoh: Solusi Kasir Praktis & Cepat"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-3456-7890"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif Pajak PPN (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(Number(e.target.value) || 0)}
                placeholder="0 atau 11"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Toko</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Pemuda No. 88, Jakarta Selatan"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pesan Footer Struk</label>
              <textarea
                rows={2}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                placeholder="Pesan ucapan terima kasih di bagian bawah struk..."
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Pengaturan Tersimpan!
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-700 flex items-center justify-center font-bold">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Pencadangan & Pemulihan Data</h3>
            <p className="text-xs text-slate-500">
              Data kasir, foto produk, dan riwayat transaksi tersimpan otomatis di database IndexedDB browser Anda.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-800">Unduh Backup Data (JSON)</h4>
              <p className="text-xs text-slate-500 mt-1">
                Simpan salinan data produk beserta seluruh foto, daftar kasir, dan transaksi ke file JSON di komputer/HP Anda.
              </p>
            </div>
            <button
              onClick={handleExport}
              className="mt-3 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Unduh File Cadangan</span>
            </button>
          </div>

          {/* Import */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-800">Pulihkan dari File Backup</h4>
              <p className="text-xs text-slate-500 mt-1">
                Pilih file JSON backup yang pernah Anda unduh sebelumnya untuk mengembalikan data.
              </p>
            </div>
            <label className="mt-3 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Pilih File Backup (.json)</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>
        </div>

        {importMessage && (
          <p className="text-xs font-bold text-blue-600 bg-blue-50 p-2.5 rounded-xl border border-blue-200 flex items-center gap-1.5">
            <Info className="w-4 h-4" /> {importMessage}
          </p>
        )}

        {/* Reset button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-600 block">Reset ke Data Contoh Asli</span>
            <span className="text-[11px] text-slate-400">
              Kembalikan daftar menu makanan, foto produk default, dan kasir bawaan.
            </span>
          </div>
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="text-xs text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Confirm Reset Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset ke Data Bawaan?"
        message="Semua data produk baru, foto, akun kasir tambahan, dan riwayat transaksi akan dikembalikan ke data awal contoh."
        confirmLabel="Ya, Reset Semua"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
