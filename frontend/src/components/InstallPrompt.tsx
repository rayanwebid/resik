import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISSED_KEY = 'fastko-pwa-install-dismissed-v2';

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosDevice, setIosDevice] = useState(false);

  useEffect(() => {
    if (isStandalone() || sessionStorage.getItem(DISMISSED_KEY) === '1') return;

    const ios = isIos();
    setIosDevice(ios);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setInstallEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // iOS does not emit beforeinstallprompt, so show manual instructions there.
    if (ios) setVisible(true);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') setVisible(false);
    setInstallEvent(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          aria-label="Tutup pemberitahuan instalasi aplikasi"
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4 pr-8">
          <img
            src="/fastko-icon-192-v2.png"
            alt="Logo Fastko Recycle"
            className="h-16 w-16 rounded-2xl border border-emerald-100 bg-white object-contain p-1 shadow-sm"
          />
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-emerald-600">Fastko Recycle</p>
            <h2 id="pwa-install-title" className="text-xl font-extrabold text-slate-900">Install aplikasi Fastko</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Akses Fastko Recycle lebih cepat langsung dari perangkat Anda.
            </p>
          </div>
        </div>

        {iosDevice ? (
          <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-slate-700">
            Di iPhone/iPad, tekan tombol <strong>Bagikan</strong> lalu pilih <strong>Tambahkan ke Layar Utama</strong>.
          </p>
        ) : (
          <button
            type="button"
            onClick={install}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-600/20"
          >
            <Download className="h-4 w-4" />
            Install Aplikasi Fastko Recycle
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          className="mt-3 w-full rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
        >
          Nanti saja
        </button>
      </div>
    </div>
  );
}
