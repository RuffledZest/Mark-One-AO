"use client";

import { useArweave } from '@/components/ArweaveHandler';

// Arweave Documentation
const AOModule: string = "Do_Uc2Sju_ffp6Ev0AnLVdPtot15rvMjP-a9VVaA5fM"; // aos 2.0.1
const AOScheduler: string = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";

interface Tag {
  name: string;
  value: string;
}

const CommonTags: Tag[] = [
  { name: "Name", value: "Anon" },
  { name: "Version", value: "0.2.1" },
];

// Initialize aoconnect only on the client side
let aoconnect: any = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

const initializeAoconnect = async () => {
  if (typeof window === 'undefined') return;
  if (aoconnect) return;
  if (isInitializing) return initPromise;
  
  isInitializing = true;
  try {
    const module = await import(/* webpackChunkName: "aoconnect" */ '@permaweb/aoconnect');
    aoconnect = module.connect({
      MODE: "mainnet",
      MU_URL: "https://mu.ao-testnet.xyz",
      CU_URL: "https://cu.ao-testnet.xyz",
      GATEWAY_URL: "https://arweave.net"
    });
    isInitializing = false;
    return;
  } catch (error) {
    console.error('Failed to load aoconnect:', error);
    isInitializing = false;
    initPromise = null;
    throw error;
  }
};

// Ensure aoconnect is initialized before use
const ensureAoconnect = async () => {
  if (!aoconnect) {
    try {
      await initializeAoconnect();
    } catch (error) {
      console.error('Failed to initialize aoconnect:', error);
      throw new Error('Failed to initialize aoconnect');
    }
  }
  if (!aoconnect) {
    throw new Error('aoconnect not initialized');
  }
};

declare global {
  interface Window {
    arweaveWallet: {
      connect: (permissions: string[], appInfo: { name: string; logo: string }, gateway?: {
        host: string;
        port: number;
        protocol: string;
      }) => Promise<void>;
      disconnect: () => Promise<void>;
      getActiveAddress: () => Promise<string>;
    };
  }

  interface globalThis {
    arweaveWallet?: Window['arweaveWallet'];
  }
}

// connect wallet
export const connectWallet = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    if (!window.arweaveWallet) {
      alert('No Arconnect detected');
      return;
    }
    await window.arweaveWallet.connect(
      ['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'ACCESS_TOKENS'],
      {
        name: 'Anon',
        logo: 'https://arweave.net/jAvd7Z1CBd8gVF2D6ESj7SMCCUYxDX_z3vpp5aHdaYk',
      },
      {
        host: 'g8way.io',
        port: 443,
        protocol: 'https',
      }
    );
    window.dispatchEvent(new Event("wallet-connected"));
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    throw error;
  }
};

// disconnect wallet
export async function disconnectWallet(): Promise<void> {
  if (typeof window === 'undefined') return;
  return await window.arweaveWallet.disconnect();
}

// get wallet details
export const getWalletAddress = async (): Promise<string> => {
  if (typeof window === 'undefined') return '';
  
  try {
    const walletAddress = await window.arweaveWallet.getActiveAddress();
    console.log(walletAddress);
    window.dispatchEvent(new Event("wallet-connected"));
    return walletAddress;
  } catch (error) {
    window.dispatchEvent(new Event("wallet-disconnected"));
    throw error;
  }
};

// spawn process
export const spawnProcess = async (name: string, tags: Tag[] = []): Promise<string> => {
  if (typeof window === 'undefined') return '';
  await ensureAoconnect();
  
  try {
    const allTags: Tag[] = [...CommonTags, ...tags];
    if (name) {
      allTags.push({ name: "Name", value: name });
    }

    console.log(allTags);
    
    const signi = await getWalletAddress(); 
    console.log(signi);
    const processId = await aoconnect.spawn({
      module: AOModule,
      scheduler: AOScheduler,
      signer: aoconnect.createDataItemSigner(window.arweaveWallet),
      tags: allTags
    });
    console.log(processId);

    return processId;
  } catch (error) {
    console.error("Error spawning process:", error);
    throw error;
  }
};

// send message to process
interface MessageParams {
  tags?: Tag[];
  data: string;
  anchor?: string;
  process: string;
}

export const messageAR = async ({ tags = [], data, anchor = '', process }: MessageParams): Promise<string> => {
  if (typeof window === 'undefined') return '';
  await ensureAoconnect();
  
  try {
    if (!process) throw new Error("Process ID is required.");
    if (!data) throw new Error("Data is required.");

    const allTags = [...CommonTags, ...tags];
    const messageId = await aoconnect.message({
      data,
      anchor,
      process,
      tags: allTags,
      signer: aoconnect.createDataItemSigner(window.arweaveWallet)
    });
    return messageId;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Export the Arweave hook for components to use
export { useArweave };