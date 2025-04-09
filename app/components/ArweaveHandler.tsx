"use client";

import { useEffect, useState } from 'react';
import { connect } from '@permaweb/aoconnect';

let aoconnect: any = null;

export const useArweave = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!aoconnect) {
          aoconnect = connect({
            MODE: "mainnet",
            MU_URL: "https://mu.ao-testnet.xyz",
            CU_URL: "https://cu.ao-testnet.xyz",
            GATEWAY_URL: "https://arweave.net"
          });
        }
        setIsInitialized(true);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to initialize aoconnect:', err);
      }
    };

    initialize();
  }, []);

  const spawnProcess = async (name: string, tags: any[] = []) => {
    if (!aoconnect) throw new Error('aoconnect not initialized');
    
    try {
      const allTags = [
        { name: "Name", value: "Anon" },
        { name: "Version", value: "0.2.1" },
        ...tags
      ];
      if (name) {
        allTags.push({ name: "Name", value: name });
      }

      const signer = aoconnect.createDataItemSigner(window.arweaveWallet);
      const processId = await aoconnect.spawn({
        module: "Do_Uc2Sju_ffp6Ev0AnLVdPtot15rvMjP-a9VVaA5fM",
        scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
        signer,
        tags: allTags
      });

      return processId;
    } catch (error) {
      console.error("Error spawning process:", error);
      throw error;
    }
  };

  const messageAR = async ({ tags = [], data, anchor = '', process }: any) => {
    if (!aoconnect) throw new Error('aoconnect not initialized');
    
    try {
      if (!process) throw new Error("Process ID is required.");
      if (!data) throw new Error("Data is required.");

      const allTags = [
        { name: "Name", value: "Anon" },
        { name: "Version", value: "0.2.1" },
        ...tags
      ];

      const signer = aoconnect.createDataItemSigner(window.arweaveWallet);
      const messageId = await aoconnect.message({
        data,
        anchor,
        process,
        tags: allTags,
        signer
      });

      return messageId;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  return {
    isInitialized,
    error,
    spawnProcess,
    messageAR
  };
}; 