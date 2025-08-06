import { usePWA } from '../lib/pwa';
import { X, Download, Smartphone, Monitor, Zap } from 'lucide-react';

interface PWAInstallProps {
  onDismiss?: () => void;
}

export function PWAInstall({ onDismiss }: PWAInstallProps) {
  const { isInstallable, isInstalled, install } = usePWA();

  // Don't show if not installable or already installed
  if (!isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    const result = await install();
    if (result === 'accepted') {
      onDismiss?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* App icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">🎵</span>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">
            Install MelodicBook
          </h2>
          <p className="text-slate-400">
            Get the full app experience with faster loading and offline access
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-green-400" />
            </div>
            <span className="text-slate-300">Lightning fast performance</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Download size={16} className="text-blue-400" />
            </div>
            <span className="text-slate-300">Works offline</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Smartphone size={16} className="text-purple-400" />
            </div>
            <span className="text-slate-300">Mobile app-like experience</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Monitor size={16} className="text-orange-400" />
            </div>
            <span className="text-slate-300">No browser distractions</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 px-4 text-slate-400 hover:text-white border border-slate-600 rounded-lg font-medium transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02]"
          >
            Install App
          </button>
        </div>

        {/* Small print */}
        <p className="text-xs text-slate-500 text-center mt-4">
          Free to install • No app store required
        </p>
      </div>
    </div>
  );
}

// PWA Install Banner (less intrusive)
export function PWAInstallBanner({ onDismiss }: PWAInstallProps) {
  const { isInstallable, isInstalled, install } = usePWA();

  if (!isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    const result = await install();
    if (result === 'accepted') {
      onDismiss?.();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-xl p-4 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🎵</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm">
            Install MelodicBook
          </p>
          <p className="text-slate-300 text-xs truncate">
            Get faster access and offline support
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1"
          >
            <X size={16} />
          </button>
          <button
            onClick={handleInstall}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
