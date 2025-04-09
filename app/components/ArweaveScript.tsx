"use client";

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    arweave : any;
    Arweave: any;
  }
}

export const useArweaveScript = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window.arweaveWallet === 'undefined') return;

    const loadScript = () => {
      if (window.Arweave) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/arweave@1.14.0/bundles/web.bundle.min.js';
      script.async = true;
      
      script.onload = () => {
        try {
          // Initialize Arweave
          const arweave = new window.Arweave({
            host: 'arweave.net',
            port: 443,
            protocol: 'https'
          });

          // Set up AO specific configuration
          window.arweave = arweave;
          window.arweave.connect = () => ({
            MODE: "mainnet",
            MU_URL: "https://mu.ao-testnet.xyz",
            CU_URL: "https://cu.ao-testnet.xyz",
            GATEWAY_URL: "https://arweave.net"
          });

          setIsLoaded(true);
        } catch (err) {
          console.error('Error initializing arweave:', err);
          setError(err as Error);
        }
      };

      script.onerror = (err) => {
        console.error('Failed to load arweave script:', err);
        setError(new Error('Failed to load arweave script'));
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