import React, { useRef } from 'react';
import {
  Printer,
  Share2,
  X,
  CheckCircle2,
  PlusCircle,
  Copy,
  Check,
  MessageCircle,
} from 'lucide-react';
import { Transaction, StoreSettings } from '../types';
import { formatRupiah, formatDateTime } from '../services/imageUtils';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  settings: StoreSettings;
  onNewTransaction: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  settings,
  onNewTransaction,
}) => {
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !transaction) return null;

  const [printError, setPrintError] = React.useState<string>('');

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      setPrintError('Pencetakan dibatasi oleh browser. Anda dapat menyalin teks struk.');
    }
  };

  const getReceiptPlainText = () => {
    let text = `================================\n`;
    text += `   ${settings.storeName.toUpperCase()}\n`;
    if (settings.tagline) text += `   ${settings.tagline}\n`;
    text += `   ${settings.address}\n`;
    text += `   Telp: ${settings.phone}\n`;
    text += `================================\n`;
    text += `No. Inv : ${transaction.invoiceNumber}\n`;
    text += `Tanggal : ${formatDateTime(transaction.timestamp)}\n`;
    text += `Kasir   : ${transaction.cashierName}\n`;
    if (transaction.customerName) text += `Pelanggan: ${transaction.customerName}\n`;
    text += `--------------------------------\n`;

    transaction.items.forEach((item) => {
      text += `${item.name}\n`;
      text += `  ${item.quantity} x ${formatRupiah(item.price)} = ${formatRupiah(item.subtotal)}\n`;
      if (item.note) text += `  (Catatan: ${item.note})\n`;
    });

    text += `--------------------------------\n`;
    text += `Subtotal : ${formatRupiah(transaction.subtotal)}\n`;
    if (transaction.discount > 0) text += `Diskon   : -${formatRupiah(transaction.discount)}\n`;
    if (transaction.tax > 0) text += `Pajak    : ${formatRupiah(transaction.tax)}\n`;
    text += `TOTAL    : ${formatRupiah(transaction.total)}\n`;
    text += `--------------------------------\n`;
    text += `Metode   : ${transaction.paymentMethod.toUpperCase()}\n`;
    text += `Bayar    : ${formatRupiah(transaction.amountPaid)}\n`;
    text += `Kembali  : ${formatRupiah(transaction.change)}\n`;
    text += `================================\n`;
    text += `${settings.receiptFooter || 'Terima kasih atas kunjungan Anda!'}\n`;
    text += `================================\n`;
    return text;
  };

  const handleCopy = () => {
    const text = getReceiptPlainText();
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(
          () => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          },
          () => fallbackCopy(text)
        );
      } else {
        fallbackCopy(text);
      }
    } catch {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const waText = encodeURIComponent(getReceiptPlainText());

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        {/* Modal Top Banner (Not printed) */}
        <div className="no-print bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Transaksi Berhasil!</h3>
              <p className="text-[11px] text-slate-400">Struk siap dicetak atau dibagikan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE THERMAL RECEIPT CONTAINER */}
        <div className="p-4 sm:p-6 bg-slate-100/70 overflow-y-auto max-h-[60vh] flex justify-center">
          <div
            id="thermal-receipt"
            ref={receiptRef}
            className="w-full max-w-[340px] bg-white p-5 rounded-xl shadow-md border border-slate-200 font-mono text-xs text-slate-900"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h4 className="font-bold text-sm tracking-tight text-slate-950 font-sans">
                {settings.storeName}
              </h4>
              {settings.tagline && (
                <p className="text-[11px] text-slate-500 font-sans">{settings.tagline}</p>
              )}
              <p className="text-[10px] text-slate-500 mt-1">{settings.address}</p>
              <p className="text-[10px] text-slate-500">Telp: {settings.phone}</p>
            </div>

            {/* Info */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Inv:</span>
                <span className="font-bold">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu:</span>
                <span>{formatDateTime(transaction.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kasir:</span>
                <span className="font-semibold text-slate-800">{transaction.cashierName}</span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Pelanggan:</span>
                  <span className="font-semibold">{transaction.customerName}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-2">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  <div className="flex justify-between text-slate-600 pl-2">
                    <span>
                      {item.quantity} x {formatRupiah(item.price)}
                    </span>
                    <span className="font-bold">{formatRupiah(item.subtotal)}</span>
                  </div>
                  {item.note && (
                    <div className="text-[10px] text-slate-400 pl-2 italic">
                      Catatan: {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>{formatRupiah(transaction.subtotal)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span>-{formatRupiah(transaction.discount)}</span>
                </div>
              )}
              {transaction.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Pajak:</span>
                  <span>{formatRupiah(transaction.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200 text-slate-950 font-sans">
                <span>TOTAL:</span>
                <span>{formatRupiah(transaction.total)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Metode Bayar:</span>
                <span className="font-semibold uppercase">{transaction.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bayar (Tunai):</span>
                <span>{formatRupiah(transaction.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Kembalian:</span>
                <span>{formatRupiah(transaction.change)}</span>
              </div>
            </div>

            {/* Barcode Mockup & Footer */}
            <div className="pt-3 text-center space-y-2">
              <div className="flex justify-center items-center gap-0.5 h-7">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-full bg-slate-900"
                    style={{
                      width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px',
                    }}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest">
                {transaction.invoiceNumber}
              </p>
              <p className="text-[10px] text-slate-500 font-sans whitespace-pre-line leading-relaxed">
                {settings.receiptFooter || 'Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons (no-print) */}
        <div className="no-print p-4 bg-white border-t border-slate-200 flex flex-col gap-2">
          {printError && (
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg text-center font-medium">
              {printError}
            </p>
          )}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk</span>
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 text-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Kirim WA</span>
            </a>

            <button
              onClick={handleCopy}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
            </button>
          </div>

          <button
            onClick={onNewTransaction}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Transaksi Baru (Pesanan Berikutnya)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
