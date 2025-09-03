import { AgentTool } from '../types';

export const systemTools: AgentTool[] = [
  {
    id: 'system_info_client',
    name: 'Client System Info',
    description: 'Get client-side system information (browser environment)',
    category: 'system',
    parameters: {
      type: { type: 'string', description: 'Type of info (browser, screen, network, all)', optional: true },
    },
    execute: async (params) => {
      try {
        const type = params.type || 'all';
        const info: any = {};
        
        if (type === 'all' || type === 'browser') {
          info.browser = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency,
            maxTouchPoints: navigator.maxTouchPoints,
          };
        }
        
        if (type === 'all' || type === 'screen') {
          info.screen = {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            orientation: screen.orientation?.type || 'unknown',
          };
          
          info.window = {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight,
            devicePixelRatio: window.devicePixelRatio,
          };
        }
        
        if (type === 'all' || type === 'network') {
          info.network = {
            onLine: navigator.onLine,
            connection: (navigator as any).connection ? {
              effectiveType: (navigator as any).connection.effectiveType,
              downlink: (navigator as any).connection.downlink,
              rtt: (navigator as any).connection.rtt,
              saveData: (navigator as any).connection.saveData,
            } : 'Network Information API not available',
          };
          
          info.memory = (performance as any).memory ? {
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          } : 'Memory API not available';
        }
        
        if (type === 'all' || type === 'performance') {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          info.performance = {
            timing: {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
              firstPaint: 'Requires Paint Timing API',
            },
            navigation: {
              type: navigation.type,
              redirectCount: performance.getEntriesByType('navigation').length,
            },
          };
        }
        
        return {
          success: true,
          type,
          info,
          timestamp: new Date().toISOString(),
          environment: 'client',
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'system_performance_client',
    name: 'Client Performance Monitor',
    description: 'Monitor client-side performance metrics',
    category: 'system',
    parameters: {
      metric: { type: 'string', description: 'Metric to monitor (memory, timing, network)', optional: true },
      duration: { type: 'number', description: 'Monitoring duration in seconds (default: 5)', optional: true },
    },
    execute: async (params) => {
      try {
        const metric = params.metric || 'memory';
        const duration = params.duration || 5;
        const samples = 10;
        const interval = duration * 1000 / samples;
        
        const results = [];
        
        for (let i = 0; i < samples; i++) {
          const timestamp = new Date().toISOString();
          let value;
          
          switch (metric) {
            case 'memory':
              value = (performance as any).memory ? {
                usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
              } : { error: 'Memory API not available' };
              break;
              
            case 'timing':
              const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
              value = {
                domInteractive: navigation.domInteractive,
                domComplete: navigation.domComplete,
                loadEventEnd: navigation.loadEventEnd,
              };
              break;
              
            case 'network':
              value = (navigator as any).connection ? {
                effectiveType: (navigator as any).connection.effectiveType,
                downlink: (navigator as any).connection.downlink,
                rtt: (navigator as any).connection.rtt,
              } : { error: 'Network Information API not available' };
              break;
              
            default:
              value = { error: 'Unknown metric' };
          }
          
          results.push({ timestamp, value });
          
          if (i < samples - 1) {
            await new Promise(resolve => setTimeout(resolve, interval));
          }
        }
        
        return {
          success: true,
          metric,
          duration,
          samples: results.length,
          results,
          environment: 'client',
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'system_storage_client',
    name: 'Client Storage Info',
    description: 'Get client-side storage information',
    category: 'system',
    parameters: {
      type: { type: 'string', description: 'Type of storage (local, session, cookie, indexeddb, all)', optional: true },
    },
    execute: async (params) => {
      try {
        const type = params.type || 'all';
        const info: any = {};
        
        if (type === 'all' || type === 'local') {
          try {
            info.localStorage = {
              length: localStorage.length,
              estimatedSize: new Blob(Object.values(localStorage)).size,
              keys: Object.keys(localStorage),
            };
          } catch (error) {
            info.localStorage = { error: 'LocalStorage not available' };
          }
        }
        
        if (type === 'all' || type === 'session') {
          try {
            info.sessionStorage = {
              length: sessionStorage.length,
              estimatedSize: new Blob(Object.values(sessionStorage)).size,
              keys: Object.keys(sessionStorage),
            };
          } catch (error) {
            info.sessionStorage = { error: 'SessionStorage not available' };
          }
        }
        
        if (type === 'all' || type === 'cookie') {
          try {
            const cookies = document.cookie.split(';').map(cookie => cookie.trim());
            info.cookies = {
              count: cookies.length,
              size: new Blob(document.cookie).size,
              domains: [...new Set(cookies.map(cookie => cookie.split('=')[0]))],
            };
          } catch (error) {
            info.cookies = { error: 'Cookies not available' };
          }
        }
        
        if (type === 'all' || type === 'indexeddb') {
          try {
            const databases = await (window.indexedDB as any).databases();
            info.indexedDB = {
              count: databases.length,
              databases: databases.map((db: any) => ({ name: db.name, version: db.version })),
            };
          } catch (error) {
            info.indexedDB = { error: 'IndexedDB not available' };
          }
        }
        
        return {
          success: true,
          type,
          info,
          timestamp: new Date().toISOString(),
          environment: 'client',
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  },
  {
    id: 'system_geolocation_client',
    name: 'Client Geolocation',
    description: 'Get client location information (requires permission)',
    category: 'system',
    parameters: {
      highAccuracy: { type: 'boolean', description: 'Use high accuracy mode', optional: true },
      timeout: { type: 'number', description: 'Timeout in milliseconds', optional: true },
    },
    execute: async (params) => {
      try {
        if (!navigator.geolocation) {
          return { success: false, error: 'Geolocation not available' };
        }
        
        const options: PositionOptions = {
          enableHighAccuracy: params.highAccuracy || false,
          timeout: params.timeout || 10000,
          maximumAge: 0,
        };
        
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
        
        return {
          success: true,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          },
          timestamp: new Date().toISOString(),
          environment: 'client',
        };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.message,
          code: error.code,
          permissionDenied: error.code === error.PERMISSION_DENIED,
        };
      }
    },
  },
  {
    id: 'system_battery_client',
    name: 'Client Battery Info',
    description: 'Get client battery information (if available)',
    category: 'system',
    parameters: {},
    execute: async (params) => {
      try {
        if (!(navigator as any).getBattery) {
          return { success: false, error: 'Battery API not available' };
        }
        
        const battery = await (navigator as any).getBattery();
        
        return {
          success: true,
          battery: {
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime,
          },
          timestamp: new Date().toISOString(),
          environment: 'client',
        };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    },
  },
];