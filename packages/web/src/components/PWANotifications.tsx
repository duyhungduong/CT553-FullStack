import { useState, useEffect } from 'react';
import { Download, RefreshCw, X } from 'lucide-react';
import { usePWA } from '../lib/pwa';

export function PWAUpdateNotification() {
  const { updateAvailable, applyUpdate } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setIsVisible(true);
    }
  }, [updateAvailable]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await applyUpdate();
    } catch (error) {
      console.error('Failed to apply update:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-gradient-to-r from-green-900/90 to-emerald-900/90 backdrop-blur-lg rounded-xl p-4 max-w-sm z-50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Download size={20} className="text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm mb-1">
            Update Available
          </p>
          <p className="text-green-100 text-xs mb-3">
            A new version of MelodicBook is ready to install
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1"
            >
              {isUpdating ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Download size={12} />
                  Update Now
                </>
              )}
            </button>
            
            <button
              onClick={handleDismiss}
              className="text-green-200 hover:text-white px-2 py-1.5 rounded-lg text-xs transition-colors"
            >
              Later
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-green-300 hover:text-white p-1 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

// Network Status Indicator
export function NetworkStatus() {
  const { isOnline } = usePWA();
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
    } else {
      // Hide after a brief moment when back online
      const timer = setTimeout(() => setShowOffline(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOffline) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-4 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 z-50 ${
      isOnline 
        ? 'bg-green-500/90 text-white'
        : 'bg-red-500/90 text-white'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-white' : 'bg-white animate-pulse'
        }`} />
        {isOnline ? 'Back Online' : 'You\'re Offline'}
      </div>
    </div>
  );
}
