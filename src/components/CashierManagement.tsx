import React, { useState } from 'react';
import {
  UserPlus,
  Shield,
  Key,
  Clock,
  Phone,
  CheckCircle2,
  Trash2,
  Edit3,
  UserCheck,
  AlertCircle,
  X,
  Lock,
  User,
  ShoppingBag,
} from 'lucide-react';
import { CashierAccount, CashierRole, Transaction } from '../types';
import { formatRupiah, formatDateTime } from '../services/imageUtils';
import { ConfirmModal } from './ConfirmModal';

interface CashierManagementProps {
  cashiers: CashierAccount[];
  activeCashier: CashierAccount | null;
  transactions: Transaction[];
  onAddOrUpdateCashier: (cashier: CashierAccount) => Promise<void>;
  onDeleteCashier: (id: string) => Promise<void>;
  onSetActiveCashier: (cashier: CashierAccount) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
];

export const CashierManagement: React.FC<CashierManagementProps> = ({
  cashiers,
  activeCashier,
  transactions,
  onAddOrUpdateCashier,
  onDeleteCashier,
  onSetActiveCashier,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCashier, setEditingCashier] = useState<CashierAccount | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<CashierRole>('cashier');
  const [phone, setPhone] = useState('');
  const [shift, setShift] = useState('Shift Pagi (08:00 - 16:00)');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [isActive, setIsActive] = useState(true);

  // Stats calculation per cashier
  const getCashierStats = (cashierId: string) => {
    const cashTrans = transactions.filter((t) => t.cashierId === cashierId);
    const totalOmzet = cashTrans.reduce((sum, t) => sum + t.total, 0);
    return {
      count: cashTrans.length,
      omzet: totalOmzet,
    };
  };

  const handleOpenAdd = () => {
    setEditingCashier(null);
    setName('');
    setUsername('');
    setPin('');
    setRole('cashier');
    setPhone('');
    setShift('Shift Pagi (08:00 - 16:00)');
    setAvatar(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CashierAccount) => {
    setEditingCashier(c);
    setName(c.name);
    setUsername(c.username);
    setPin(c.pin);
    setRole(c.role);
    setPhone(c.phone || '');
    setShift(c.shift || 'Shift Pagi (08:00 - 16:00)');
    setAvatar(c.avatar || AVATAR_PRESETS[0]);
    setIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const [formError, setFormError] = useState<string>('');
  const [notice, setNotice] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Nama kasir wajib diisi.');
      return;
    }
    if (!pin.trim() || pin.length < 4) {
      setFormError('PIN harus terdiri dari minimal 4 digit angka.');
      return;
    }
    setFormError('');

    const newCashier: CashierAccount = {
      id: editingCashier ? editingCashier.id : `cashier-${Date.now()}`,
      name: name.trim(),
      username: username.trim().toLowerCase() || name.toLowerCase().replace(/\s+/g, '_'),
      pin: pin.trim(),
      role,
      phone: phone.trim() || undefined,
      shift: shift.trim() || undefined,
      avatar,
      isActive,
      createdAt: editingCashier ? editingCashier.createdAt : Date.now(),
    };

    await onAddOrUpdateCashier(newCashier);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, cashierName: string) => {
    if (cashiers.length <= 1) {
      setNotice('Tidak dapat menghapus akun kasir terakhir.');
      setTimeout(() => setNotice(''), 4000);
      return;
    }
    if (activeCashier?.id === id) {
      setNotice('Tidak dapat menghapus akun kasir yang sedang aktif bertugas. Silakan ganti kasir terlebih dahulu.');
      setTimeout(() => setNotice(''), 4000);
      return;
    }
    setDeleteTarget({ id, name: cashierName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await onDeleteCashier(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen Akun Kasir</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambah dan kelola akun kasir, tetapkan hak akses (Role), shift kerja, dan PIN login.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/20 text-sm transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Kasir Baru</span>
        </button>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Cashier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cashiers.map((c) => {
          const isCurrentActive = activeCashier?.id === c.id;
          const stats = getCashierStats(c.id);

          return (
            <div
              key={c.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all relative flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top: Avatar, Name, Role badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={c.avatar || AVATAR_PRESETS[0]}
                        alt={c.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                      />
                      {isCurrentActive && (
                        <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{c.name}</h4>
                      </div>
                      <span className="text-xs font-mono text-slate-400">@{c.username}</span>

                      {/* Role Pill */}
                      <div className="mt-1 flex items-center gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            c.role === 'admin'
                              ? 'bg-rose-100 text-rose-700'
                              : c.role === 'supervisor'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {c.role}
                        </span>
                        {isCurrentActive && (
                          <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                            Sedang Bertugas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                      title="Edit Kasir"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {cashiers.length > 1 && !isCurrentActive && (
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Kasir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details list */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700">{c.shift || 'Shift Fleksibel'}</span>
                  </div>

                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-700">{c.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-slate-500">
                      PIN: <span className="font-mono font-bold text-slate-800">•••• ({c.pin})</span>
                    </span>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Transaksi</span>
                    <span className="font-bold text-slate-800">{stats.count} Transaksi</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Omzet Diproses</span>
                    <span className="font-bold text-amber-700">{formatRupiah(stats.omzet)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons: Ubah Nama & Tugaskan Kasir */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(c)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ubah Nama</span>
                </button>

                {isCurrentActive ? (
                  <div className="flex-1 py-2 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aktif</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSetActiveCashier(c)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 shadow-sm"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Tugaskan</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Cashier */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingCashier ? 'Ubah Nama & Profil Kasir' : 'Tambah Akun Kasir Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingCashier
                      ? 'Perbarui nama akun kasir, username, atau PIN'
                      : 'Tambahkan profil staf untuk melayani transaksi di kasir'}
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
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Avatar Profil Kasir:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(imgUrl)}
                      className={`relative rounded-xl overflow-hidden shrink-0 transition-all ${
                        avatar === imgUrl
                          ? 'ring-3 ring-amber-500 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Avatar ${i}`} className="w-11 h-11 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Kasir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Username & PIN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ID / Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="rian_kasir"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIN Keamanan (4 Digit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono tracking-widest border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Role & Shift */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hak Akses / Peran
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as CashierRole)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="cashier">Kasir (Transaksi)</option>
                    <option value="supervisor">Supervisor (POS + Laporan)</option>
                    <option value="admin">Owner / Admin (Akses Penuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shift Kerja
                  </label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Shift Pagi (08:00 - 16:00)">Shift Pagi (08:00 - 16:00)</option>
                    <option value="Shift Sore (16:00 - 23:00)">Shift Sore (16:00 - 23:00)</option>
                    <option value="Shift Malam (23:00 - 07:00)">Shift Malam</option>
                    <option value="Full Time / Umum">Full Time / Umum</option>
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Form Error alert */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Buttons */}
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
                  <UserPlus className="w-4 h-4" />
                  <span>{editingCashier ? 'Simpan Akun' : 'Daftarkan Kasir Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Cashier Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Akun Kasir?"
        message={`Apakah Anda yakin ingin menghapus akun kasir "${deleteTarget?.name}"?`}
        confirmLabel="Ya, Hapus Kasir"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
