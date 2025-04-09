"use client";

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    aoconnect: any;
  }
}

export const useArweaveScript = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadScript = () => {
      if (window.aoconnect) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@permaweb/aoconnect@latest/dist/aoconnect.min.js';
      script.async = true;
      
      script.onload = () => {
        try {
          window.aoconnect = window.aoconnect.connect({
            MODE: "mainnet",
            MU_URL: "https://mu.ao-testnet.xyz",
            CU_URL: "https://cu.ao-testnet.xyz",
            GATEWAY_URL: "https://arweave.net"
          });
          setIsLoaded(true);
        } catch (err) {
          console.error('Error initializing aoconnect:', err);
          setError(err as Error);
        }
      };

      script.onerror = (err) => {
        console.error('Failed to load aoconnect script:', err);
        setError(new Error('Failed to load aoconnect script'));
      };

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    };

    loadScript();
  }, []);

  return { isLoaded, error };
}; 