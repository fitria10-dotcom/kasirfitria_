import React, { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle, Edit3, Check } from 'lucide-react';
import { CashierAccount } from '../types';

interface EditCashierNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashier: CashierAccount | null;
  onSave: (updated: CashierAccount) => Promise<void>;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
];

export const EditCashierNameModal: React.FC<EditCashierNameModalProps> = ({
  isOpen,
  onClose,
  cashier,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cashier) {
      setName(cashier.name);
      setUsername(cashier.username);
      setPin(cashier.pin);
      setAvatar(cashier.avatar || AVATAR_PRESETS[0]);
      setErrorMsg('');
    }
  }, [cashier, isOpen]);

  if (!isOpen || !cashier) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama akun kasir tidak boleh kosong');
      return;
    }
    if (pin.trim().length < 4) {
      setErrorMsg('PIN kasir minimal 4 digit angka');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const updated: CashierAccount = {
        ...cashier,
        name: name.trim(),
        username: username.trim().toLowerCase() || name.toLowerCase().replace(/\s+/g, '_'),
        pin: pin.trim(),
        avatar,
      };
      await onSave(updated);
      onClose();
    } catch {
      setErrorMsg('Gagal menyimpan perubahan nama kasir.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Ubah Nama Akun Kasir</h3>
              <p className="text-xs text-slate-500">
                Nama ini akan dicetak pada struk belanja dan laporan penjualan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilihan Foto Profil Kasir:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {AVATAR_PRESETS.map((imgUrl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatar(imgUrl)}
                  className={`relative rounded-xl overflow-hidden shrink-0 transition-all ${
                    avatar === imgUrl ? 'ring-3 ring-amber-500 scale-105' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Avatar ${i}`} className="w-11 h-11 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Cashier Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Nama Lengkap Kasir <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Contoh: Fitria Oktafiani"
              className="w-full px-3.5 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
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
                placeholder="fitria_pos"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PIN Keamanan
              </label>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono tracking-widest border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Nama Kasir'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
