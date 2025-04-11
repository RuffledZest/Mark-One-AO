"use client";

import { useEffect, useState } from "react";
import Arweave from "arweave";

declare global {
  interface Window {
    arweave: any;
    Arweave: any;
  }
}

export const useArweaveScript = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window.arweaveWallet === "undefined") return;

    const loadScript = () => {
      if (window.Arweave) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/arweave@1.14.0/bundles/web.bundle.min.js";
      script.async = true;

      script.onload = () => {
        try {
          // Initialize Arweave
          const arweave = Arweave.init({
            host: "localhost",
            port: 1984,
            protocol: "http",
          });

          window.arweaveWallet.connect(["ACCESS_ADDRESS"], {
            name: "MarkOne",
            logo: "https://markone.xyz/logo.svg",
          });

          setIsLoaded(true);
        } catch (err) {
          console.error("Error initializing arweave:", err);
          setError(err as Error);
        }
      };

      script.onerror = (err) => {
        console.error("Failed to load arweave script:", err);
        setError(new Error("Failed to load arweave script"));
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
