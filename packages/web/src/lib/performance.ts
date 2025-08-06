import { config } from './config';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (config.ENABLE_PERFORMANCE_MONITORING && typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring(): void {
    // Basic navigation timing
    window.addEventListener('load', () => {
      this.captureNavigationTiming();
    });

    // Web Vitals
    this.observeWebVitals();
  }

  private captureNavigationTiming(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      
      if (config.ENABLE_DEBUG_LOGS) {
        console.log('📊 Navigation Timing:', {
          loadTime: `${this.metrics.loadTime}ms`,
          domContentLoaded: `${this.metrics.domContentLoaded}ms`,
        });
      }
    }
  }

  private observeWebVitals(): void {
    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEventTiming;
        
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        
        if (config.ENABLE_DEBUG_LOGS) {
          console.log('📊 LCP:', `${lastEntry.startTime}ms`);
        }
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);
    } catch {
      console.warn('LCP observer not supported');
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0] as PerformanceEventTiming;
        
        this.metrics.firstInputDelay = firstInput.processingStart - firstInput.startTime;
        
        if (config.ENABLE_DEBUG_LOGS) {
          console.log('📊 FID:', `${this.metrics.firstInputDelay}ms`);
        }
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.push(fidObserver);
    } catch {
      console.warn('FID observer not supported');
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        this.metrics.cumulativeLayoutShift = clsValue;
        
        if (config.ENABLE_DEBUG_LOGS) {
          console.log('📊 CLS:', clsValue);
        }
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(clsObserver);
    } catch {
      console.warn('CLS observer not supported');
    }
  }

  // API call timing
  public measureApiCall<T>(
    apiCall: Promise<T>,
    endpoint: string
  ): Promise<T> {
    if (!config.ENABLE_PERFORMANCE_MONITORING) {
      return apiCall;
    }

    const startTime = performance.now();
    
    return apiCall
      .then((result) => {
        const duration = performance.now() - startTime;
        
        if (config.ENABLE_DEBUG_LOGS) {
          console.log(`🚀 API Call: ${endpoint} - ${duration.toFixed(2)}ms`);
        }
        
        // Track slow API calls
        if (duration > 2000) { // Slower than 2 seconds
          console.warn(`⚠️ Slow API Call: ${endpoint} - ${duration.toFixed(2)}ms`);
        }
        
        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;
        
        if (config.ENABLE_DEBUG_LOGS) {
          console.error(`❌ API Error: ${endpoint} - ${duration.toFixed(2)}ms`, error);
        }
        
        throw error;
      });
  }

  // Component render timing
  public measureComponentRender(componentName: string, renderFn: () => void): void {
    if (!config.ENABLE_PERFORMANCE_MONITORING) {
      renderFn();
      return;
    }

    const startTime = performance.now();
    renderFn();
    const duration = performance.now() - startTime;
    
    if (config.ENABLE_DEBUG_LOGS && duration > 16) { // Slower than 60fps
      console.warn(`🐌 Slow Render: ${componentName} - ${duration.toFixed(2)}ms`);
    }
  }

  // Get current metrics
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics } as PerformanceMetrics;
  }

  // Report metrics (for analytics or monitoring services)
  public reportMetrics(): void {
    if (config.IS_PRODUCTION) {
      // Send metrics to your analytics service
      console.log('📊 Performance Metrics:', this.metrics);
      
      // Example: Send to analytics
      // analytics.track('Performance Metrics', this.metrics);
    }
  }

  // Cleanup observers
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(performance.now());

  useEffect(() => {
    if (!config.ENABLE_PERFORMANCE_MONITORING) return;

    renderCountRef.current += 1;
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTimeRef.current;
    
    if (config.ENABLE_DEBUG_LOGS && renderTime > 100) {
      console.warn(`🔄 Component Re-render: ${componentName} - ${renderTime.toFixed(2)}ms (${renderCountRef.current} renders)`);
    }
    
    lastRenderTimeRef.current = currentTime;
  });

  return {
    renderCount: renderCountRef.current,
    measureRender: (fn: () => void) => 
      performanceMonitor.measureComponentRender(componentName, fn),
  };
};

export default performanceMonitor;
