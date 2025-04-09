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

export async function disconnectWallet() {
  if (!isClient || !window.arweaveWallet) return;
  try {
    await window.arweaveWallet.disconnect();
  } catch (error) {
    console.error(error);
  }
}

export async function getWalletAddress(): Promise<string> {
  if (!isClient || !window.arweaveWallet) return '';
  try {
    const walletAddress = await window.arweaveWallet.getActiveAddress();
    console.log(walletAddress);
    return walletAddress;
  } catch (error) {
    console.error(error);
    return '';
  }
}

export const spawnProcess = async (name: string, tags: any[] = []): Promise<string> => {
  if (!isClient) return '';
  
  try {
    if (window.arweaveWallet == undefined) {
      return '';
    }

    const allTags = [...CommonTags, ...tags];
    if (name) {
      allTags.push({ name: "Name", value: name });
    }

    console.log(allTags);
    
    const signi = await getWalletAddress(); 
    console.log(signi);

    // Create a transaction with required data
    const arweave = new window.Arweave({
      host: 'arweave.net',
      port: 443,
      protocol: 'https'
    });

    const transaction = await arweave.createTransaction({
      data: JSON.stringify({
        type: 'process',
        name: name,
        timestamp: Date.now()
      }),
      tags: allTags
    });

    // Sign the transaction using the correct method
    const signedTransaction = await window.arweaveWallet.sign(transaction);
    if (!signedTransaction) {
      throw new Error('Failed to sign transaction');
    }

    // Post the transaction
    const response = await arweave.transactions.post(signedTransaction);
    console.log('Transaction posted:', response);

    return response.id || '';
  } catch (error) {
    console.error("Error spawning process:", error);
    return '';
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

    const allTags = [...CommonTags, ...tags];
    const signer = createDataItemSigner(window.arweaveWallet);

    const messageId = await message({
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
}
