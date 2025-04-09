"use client";

import { useCallback } from 'react';
import { useArweaveScript } from './ArweaveScript';

export const useArweave = () => {
  const { isLoaded, error: scriptError } = useArweaveScript();

  const spawnProcess = useCallback(async (name: string, tags: any[] = []) => {
    if (typeof window.arweaveWallet === 'undefined') return ;
    if (!isLoaded) {
      throw new Error('aoconnect not loaded');
    }
    
    try {
      const allTags = [
        { name: "Name", value: "Anon" },
        { name: "Version", value: "0.2.1" },
        ...tags
      ];
      if (name) {
        allTags.push({ name: "Name", value: name });
      }

      const signer = window.aoconnect.createDataItemSigner(window.arweaveWallet);
      const processId = await window.aoconnect.spawn({
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
  }, [isLoaded]);

  const messageAR = useCallback(async ({ tags = [], data, anchor = '', process }: any) => {
    if (typeof window === 'undefined') return '';
    if (!isLoaded) {
      throw new Error('aoconnect not loaded');
    }
    
    try {
      if (!process) throw new Error("Process ID is required.");
      if (!data) throw new Error("Data is required.");

      const allTags = [
        { name: "Name", value: "Anon" },
        { name: "Version", value: "0.2.1" },
        ...tags
      ];

      const signer = window.aoconnect.createDataItemSigner(window.arweaveWallet);
      const messageId = await window.aoconnect.message({
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
  }, [isLoaded]);

  return {
    isLoaded,
    error: scriptError,
    spawnProcess,
    messageAR
  };
}; 