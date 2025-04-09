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

import {
  spawn,
  message,
  createDataItemSigner,
} from "@permaweb/aoconnect";

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
  return await window.arweaveWallet.disconnect();
}

// get wallet details
export const getWalletAddress = async (): Promise<string> => {
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

// spawn process [ don't change anything in the function use it as it is *important]
export const spawnProcess = async (name: string, tags: Tag[] = []): Promise<string> => {
  try {
    const allTags: Tag[] = [...CommonTags, ...tags];
    if (name) {
      allTags.push({ name: "Name", value: name });
    }

    console.log(allTags);
    
    const signi = await getWalletAddress(); 
    console.log(signi);
    const processId = await spawn({
      module: AOModule,
      scheduler: AOScheduler,
      signer: createDataItemSigner(window.arweaveWallet),
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
  try {
    if (!process) throw new Error("Process ID is required.");
    if (!data) throw new Error("Data is required.");

    const allTags = [...CommonTags, ...tags];
    const messageId = await message({
      data,
      anchor,
      process,
      tags: allTags,
      signer: createDataItemSigner((globalThis as typeof globalThis & { arweaveWallet: Window['arweaveWallet'] }).arweaveWallet)
    });
    return messageId;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};