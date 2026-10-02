import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    if (sessionStorage.getItem('pwa_banner_dismissed') === 'true') {
      setIsDismissed(true);
    }

    // Check if already in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Android/Chromium install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (isInstalled || isDismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <div className="w-full my-4 p-4 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-700 border border-stone-800 dark:border-stone-600 shadow-lg relative overflow-hidden transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">
              Install NextDayOff App
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              Add to your home screen for quick offline access and countdown checks.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-stone-400 hover:text-stone-100 p-1 rounded-lg transition"
          aria-label="Dismiss install banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showIOSInstructions ? (
        <div className="mt-3 p-3 bg-stone-800/80 dark:bg-stone-800/80 rounded-xl border border-stone-700/60 text-xs text-stone-300 space-y-1.5 animate-in fade-in">
          <p className="font-semibold text-amber-400">To install on iPhone / iPad:</p>
          <div className="flex items-center gap-2">
            <Share className="w-4 h-4 text-amber-400" />
            <span>1. Tap the <strong>Share</strong> button in Safari toolbar</span>
          </div>
          <div className="flex items-center gap-2">
            <PlusSquare className="w-4 h-4 text-amber-400" />
            <span>2. Scroll down and tap <strong>"Add to Home Screen"</strong></span>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200 transition"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition active:scale-95 shadow-sm"
          >
            {isIOS ? 'Show How to Install' : 'Install App'}
          </button>
        </div>
      )}
    </div>
  );
}
