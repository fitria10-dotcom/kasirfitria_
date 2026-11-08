import React from 'react';
import { Store, ShoppingCart, Package, Users, BarChart3, Settings, Clock, UserCheck, Edit3 } from 'lucide-react';
import { CashierAccount, StoreSettings } from '../types';

interface HeaderProps {
  currentTab: 'pos' | 'products' | 'cashiers' | 'reports' | 'settings';
  setCurrentTab: (tab: 'pos' | 'products' | 'cashiers' | 'reports' | 'settings') => void;
  activeCashier: CashierAccount | null;
  onOpenSwitchCashier: () => void;
  onOpenEditCashierName: () => void;
  settings: StoreSettings;
  cartItemCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  activeCashier,
  onOpenSwitchCashier,
  onOpenEditCashierName,
  settings,
  cartItemCount,
}) => {
  const [time, setTime] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg leading-tight tracking-tight text-white">
                  {settings.storeName || 'Fitria Kasir POS'}
                </h1>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {settings.tagline || 'Sistem Kasir Pintar & Modern'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('pos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'pos'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Kasir (POS)</span>
              {cartItemCount > 0 && (
                <span className="ml-1 bg-rose-600 text-white text-xs font-bold px-1.5 py-0.2 rounded-full min-w-[20px] text-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('products')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'products'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Kelola Produk</span>
            </button>

            <button
              onClick={() => setCurrentTab('cashiers')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'cashiers'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Akun Kasir</span>
            </button>

            <button
              onClick={() => setCurrentTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'reports'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Laporan</span>
            </button>

            <button
              onClick={() => setCurrentTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </button>
          </nav>

          {/* Right Section: Time & Cashier Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-slate-200">{time}</span>
            </div>

            {/* Active Cashier Card & Switch/Edit Button */}
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 pl-2 pr-1.5 py-1 rounded-xl">
              <div
                onClick={onOpenEditCashierName}
                title="Klik untuk ubah foto & profil kasir"
                className="relative cursor-pointer hover:opacity-90"
              >
                {activeCashier?.avatar ? (
                  <img
                    src={activeCashier.avatar}
                    alt={activeCashier.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-amber-500/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center ring-1 ring-amber-500/40">
                    {activeCashier?.name?.charAt(0) || 'K'}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>

              <div
                onClick={onOpenEditCashierName}
                title="Klik untuk ubah nama kasir ini"
                className="text-left hidden sm:block cursor-pointer group"
              >
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors truncate max-w-[110px]">
                    {activeCashier?.name || 'Kasir Default'}
                  </p>
                  <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-amber-400 transition-colors shrink-0" />
                </div>
                <span className="text-[10px] text-amber-400 capitalize block leading-none">
                  {activeCashier?.role === 'admin'
                    ? 'Owner / Admin'
                    : activeCashier?.role === 'supervisor'
                    ? 'Supervisor'
                    : 'Kasir Aktif'}
                </span>
              </div>

              {/* Quick action buttons: Ubah Nama & Ganti Kasir */}
              <button
                onClick={onOpenEditCashierName}
                title="Ubah Nama Akun Kasir"
                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-400 transition-colors text-xs flex items-center gap-1 border border-amber-500/30"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px] font-semibold">Ubah Nama</span>
              </button>

              <button
                onClick={onOpenSwitchCashier}
                title="Ganti atau Kunci Kasir"
                className="p-1.5 rounded-lg bg-slate-700/70 hover:bg-slate-600 text-slate-300 transition-colors text-xs flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">Ganti</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800 overflow-x-auto gap-1 text-xs">
          <button
            onClick={() => setCurrentTab('pos')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md shrink-0 ${
              currentTab === 'pos' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Kasir</span>
            {cartItemCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1 rounded-full">{cartItemCount}</span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('products')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md shrink-0 ${
              currentTab === 'products' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Produk</span>
          </button>
          <button
            onClick={() => setCurrentTab('cashiers')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md shrink-0 ${
              currentTab === 'cashiers' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Kasir</span>
          </button>
          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md shrink-0 ${
              currentTab === 'reports' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Laporan</span>
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md shrink-0 ${
              currentTab === 'settings' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
