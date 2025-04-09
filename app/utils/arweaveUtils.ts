"use client";

// Import aoconnect dynamically to avoid SSR issues
let aoconnect: any = null;

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

// Initialize aoconnect
const initAoconnect = async () => {
  if (!isClient) return;
  if (aoconnect) return;
  
  try {
    const module = await import('@permaweb/aoconnect');
    aoconnect = module;
  } catch (error) {
    console.error('Failed to load aoconnect:', error);
  }
};

// Arweave Documentation
const AOModule = "Do_Uc2Sju_ffp6Ev0AnLVdPtot15rvMjP-a9VVaA5fM"; // aos 2.0.1
const AOScheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";
const CommonTags = [
  { name: "Name", value: "Anon" },
  { name: "Version", value: "0.2.1" },
];

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
}

// connect wallet
export async function connectWallet() {
  if (!isClient) return;
  
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
  } catch (error) {
    console.error(error);
  } finally {
    console.log('connection finished execution');
  }
}

// disconnect wallet
export async function disconnectWallet() {
  if (!isClient) return;
  return await window.arweaveWallet.disconnect();
}

// get wallet details
export async function getWalletAddress() {
  if (!isClient) return '';
  const walletAddress = await window.arweaveWallet.getActiveAddress();
  console.log(walletAddress);
  return walletAddress;
}

// spawn process
export const spawnProcess = async (name: string, tags: any[] = []) => {
  if (!isClient) return '';
  
  try {
    await initAoconnect();
    if (!aoconnect) throw new Error('Failed to initialize aoconnect');

    const allTags = [...CommonTags, ...tags];
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
export const messageAR = async ({ tags = [], data, anchor = '', process }: any) => {
  if (!isClient) return '';
  
  try {
    await initAoconnect();
    if (!aoconnect) throw new Error('Failed to initialize aoconnect');

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