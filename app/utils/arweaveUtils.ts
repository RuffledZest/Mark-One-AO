'use client';

const isClient = typeof window !== 'undefined';

const AOModule = "Do_Uc2Sju_ffp6Ev0AnLVdPtot15rvMjP-a9VVaA5fM"; // aos 2.0.1
const AOScheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";
const CommonTags = [
  { name: "Name", value: "Anon" },
  { name: "Version", value: "0.2.1" },
];

declare global {
  interface Window {
    arweaveWallet: {
      connect: (
        permissions: string[],
        appInfo: { name: string; logo: string },
        gateway?: { host: string; port: number; protocol: string }
      ) => Promise<void>;
      disconnect: () => Promise<void>;
      getActiveAddress: () => Promise<string>;
      signTransaction: (transaction: any) => Promise<any>;
      sign: (transaction: any) => Promise<any>;
    };
    Arweave: any;
  }
}

export const connectWallet = async (): Promise<void> => {
  try {
    if (typeof window === 'undefined' || !window.arweaveWallet) {
      throw new Error('Arweave wallet not found');
    }

    await window.arweaveWallet.connect([
      'ACCESS_ADDRESS',
      'SIGN_TRANSACTION',
      'ACCESS_PUBLIC_KEY',
      'SIGNATURE'
    ], {
      name: 'CanvasNotesApp',
      logo: 'https://arweave.net/logo.png'
    });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export async function disconnectWallet() {
  if (!isClient || !window.arweaveWallet) return;
  try {
    await window.arweaveWallet.disconnect();
  } catch (error) {
    console.error(error);
  }
}

export const getWalletAddress = async (): Promise<string> => {
  try {
    if (typeof window === 'undefined' || !window.arweaveWallet) {
      return '';
    }
    return await window.arweaveWallet.getActiveAddress();
  } catch (error) {
    console.error('Error getting wallet address:', error);
    return '';
  }
};

export const spawnProcess = async (name: string, tags: any[] = []): Promise<string> => {
  if (typeof window === 'undefined') return '';
  
  try {
    // Ensure wallet is connected first
    await connectWallet();
    
    const arweave = new window.Arweave({
      host: 'arweave.net',
      port: 443,
      protocol: 'https',
      timeout: 20000,
    });

    const walletAddress = await getWalletAddress();
    if (!walletAddress) {
      throw new Error('No wallet address found');
    }

    const processData = {
      name,
      creator: walletAddress,
      timestamp: Date.now(),
      type: 'process-creation',
      module: AOModule,
      scheduler: AOScheduler
    };

    const transaction = await arweave.createTransaction({
      data: JSON.stringify(processData)
    });

    // Add mandatory tags
    transaction.addTag('App-Name', 'CanvasNotesApp');
    transaction.addTag('Content-Type', 'application/json');
    transaction.addTag('Type', 'process-creation');
    transaction.addTag('Process-Name', name);
    transaction.addTag('Creator', walletAddress);
    transaction.addTag('Module', AOModule);
    transaction.addTag('Scheduler', AOScheduler);

    // Add custom tags
    for (const tag of tags) {
      transaction.addTag(tag.name, tag.value);
    }

    // Sign the transaction
    const signedTransaction = await window.arweaveWallet.sign(transaction);
    if (!signedTransaction || !signedTransaction.signature) {
      throw new Error('Transaction was not signed properly');
    }

    // Post the signed transaction
    const response = await arweave.transactions.post(signedTransaction);
    if (response.status !== 200 && response.status !== 202) {
      throw new Error('Failed to post transaction');
    }

    return transaction.id;
  } catch (error) {
    console.error('Error spawning process:', error);
    throw error; // Propagate the error instead of returning empty string
  }
};

export async function messageAR({ tags = [], data, anchor = '', process }: {
  tags?: any[],
  data: any,
  anchor?: string,
  process: string
}) {
  if (!isClient) return;

  try {
    const { message, createDataItemSigner } = await import('@permaweb/aoconnect');

    if (!process) throw new Error("Process ID is required.");
    if (!data) throw new Error("Data is required.");

    const allTags = [
      ...CommonTags,
      { name: "Module", value: AOModule },
      { name: "Scheduler", value: AOScheduler },
      ...tags
    ];
    
    const signer = createDataItemSigner(window.arweaveWallet);

    const messageId = await message({
      data,
      anchor,
      process,
      tags: allTags,
      signer
    });

    console.log('Message sent successfully:', messageId);
    return messageId;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
