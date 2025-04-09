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
    const loadScript = async () => {
      if (typeof window === 'undefined') return;
      if (window.aoconnect) {
        setIsLoaded(true);
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@permaweb/aoconnect@latest/dist/aoconnect.min.js';
        script.async = true;
        
        script.onload = () => {
          window.aoconnect = window.aoconnect.connect({
            MODE: "mainnet",
            MU_URL: "https://mu.ao-testnet.xyz",
            CU_URL: "https://cu.ao-testnet.xyz",
            GATEWAY_URL: "https://arweave.net"
          });
          setIsLoaded(true);
        };

        script.onerror = (err) => {
          console.error('Failed to load aoconnect script:', err);
          setError(new Error('Failed to load aoconnect script'));
        };

        document.body.appendChild(script);
      } catch (err) {
        console.error('Error loading aoconnect script:', err);
        setError(err as Error);
      }
    };

    loadScript();
  }, []);

  return { isLoaded, error };
}; 