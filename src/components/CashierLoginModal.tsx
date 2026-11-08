import React, { useState } from 'react';
import { X, Lock, Check, Delete, UserCheck } from 'lucide-react';
import { CashierAccount } from '../types';

interface CashierLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashiers: CashierAccount[];
  activeCashier: CashierAccount | null;
  onSwitchCashier: (cashier: CashierAccount) => void;
  onOpenAddCashier: () => void;
}

export const CashierLoginModal: React.FC<CashierLoginModalProps> = ({
  isOpen,
  onClose,
  cashiers,
  activeCashier,
  onSwitchCashier,
  onOpenAddCashier,
}) => {
  const [selectedCashier, setSelectedCashier] = useState<CashierAccount | null>(
    activeCashier || (cashiers.length > 0 ? cashiers[0] : null)
  );
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setErrorMessage('');
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage('');
  };

  const handleVerifyAndSwitch = () => {
    if (!selectedCashier) {
      setErrorMessage('Pilih akun kasir terlebih dahulu');
      return;
    }

    if (selectedCashier.pin === pin) {
      onSwitchCashier(selectedCashier);
      setPin('');
      setErrorMessage('');
      onClose();
    } else {
      setErrorMessage('PIN salah! Silakan coba lagi.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Ganti Akun Kasir</h3>
              <p className="text-xs text-slate-500">Pilih akun dan masukkan PIN untuk bertugas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cashier selection list */}
        <div className="my-4">
          <span className="text-xs font-semibold text-slate-700 block mb-2">Pilih Kasir Bertugas:</span>
          <div className="grid grid-cols-3 gap-2">
            {cashiers.map((c) => {
              const isSelected = selectedCashier?.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCashier(c);
                    setPin('');
                    setErrorMessage('');
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <img
                    src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={c.name}
                    className="w-10 h-10 rounded-full object-cover mb-1 ring-1 ring-slate-200"
                  />
                  <span className="font-bold text-xs text-slate-900 truncate w-full">{c.name}</span>
                  <span className="text-[10px] text-slate-500 capitalize">{c.role}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenAddCashier();
            }}
            className="mt-2 text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center justify-center gap-1 w-full py-1.5 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
          >
            + Daftarkan Akun Kasir Baru Lainnya
          </button>
        </div>

        {/* PIN Dots Display */}
        <div className="my-3 text-center">
          <span className="text-xs text-slate-500 block mb-2">
            Masukkan PIN untuk <span className="font-bold text-slate-800">{selectedCashier?.name}</span>
          </span>
          <div className="flex justify-center items-center gap-3 h-8">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pin.length > idx
                    ? 'bg-amber-500 border-amber-600 scale-110 shadow-sm'
                    : 'border-slate-300 bg-slate-100'
                }`}
              />
            ))}
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-600 font-semibold mt-2">{errorMessage}</p>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2 my-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num.toString())}
              className="py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-lg rounded-xl transition-all shadow-xs"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-semibold text-xs rounded-xl"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-lg rounded-xl shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 font-bold text-sm rounded-xl flex items-center justify-center"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          disabled={pin.length < 4}
          onClick={handleVerifyAndSwitch}
          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-950 font-bold text-sm rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
        >
          <UserCheck className="w-4 h-4" />
          <span>Masuk Sebagai {selectedCashier?.name?.split(' ')[0] || 'Kasir'}</span>
        </button>
      </div>
    </div>
  );
};
