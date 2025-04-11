"use client";

const isClient = typeof window !== "undefined";
import Arweave from "arweave";
const AOModule = "Do_Uc2Sju_ffp6Ev0AnLVdPtot15rvMjP-a9VVaA5fM"; // aos 2.0.1
const AOScheduler = "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA";
const CommonTags = [
  { name: "Name", value: "Anon" },
  { name: "Version", value: "0.2.1" },
];

declare global {
  interface Window {
    // @ts-expect-error ing
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
    if (typeof window === "undefined" || !window.arweaveWallet) {
      throw new Error("Arweave wallet not found");
    }

    await window.arweaveWallet.connect(
      ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "ACCESS_PUBLIC_KEY", "SIGNATURE"],
      {
        name: "CanvasNotesApp",
        logo: "https://arweave.net/logo.png",
      },
      {
        host: "localhost",
        port: 1984,
        protocol: "http",
      }
    );
  } catch (error) {
    console.error("Error connecting wallet:", error);
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
    if (typeof window === "undefined" || !window.arweaveWallet) {
      return "";
    }
    return await window.arweaveWallet.getActiveAddress();
  } catch (error) {
    console.error("Error getting wallet address:", error);
    return "";
  }
};

export const spawnProcess = async (
  name: string,
  tags: any[] = []
): Promise<string> => {
  if (typeof window === "undefined") return "";
  console.log("Spawning process inside arweaveUtils");
  try {
    // Ensure wallet is connected first
    console.log("Connecting wallet inside arweaveUtils");
    await connectWallet();
    console.log("Connected wallet inside arweaveUtils");

    const walletAddress = await getWalletAddress();
    console.log("Wallet address inside arweaveUtils", walletAddress);
    if (!walletAddress) {
      throw new Error("No wallet address found");
    }

    // Create process spawn message with proper AO format
    const processData = {
      Input: {
        Function: "Spawn",
        Module: AOModule,
        Name: name,
        Scheduler: AOScheduler,
      },
    };

    // Create transaction with all required fields
    // const transaction = await arweave.createTransaction({
    //   data: JSON.stringify(processData),
    //   last_tx: '', // Required for proper transaction creation
    //   owner: walletAddress,
    //   target: '', // No target for process creation
    //   quantity: '0', // No AR transfer
    //   reward: '0' // Will be calculated by Arweave
    // });

    const arweave = Arweave.init({
      host: "localhost",
      port: 1984,
      protocol: "http",
      // timeout: 20000,
    });
    await window.arweaveWallet.connect(["SIGN_TRANSACTION"]);

    const transaction = await arweave.createTransaction({
      data: '<html><head><meta charset="UTF-8"><title>Hello permanent world! This was signed via Wander!!!</title></head><body></body></html>',
    });

    // Add mandatory AO tags
    transaction.addTag("App-Name", "CanvasNotesApp");
    transaction.addTag("Content-Type", "application/json");
    transaction.addTag("Protocol", "AO");
    transaction.addTag("Type", "Process");
    transaction.addTag("Action", "Spawn");
    transaction.addTag("Module", AOModule);
    transaction.addTag("Scheduler", AOScheduler);
    transaction.addTag("Name", name);
    transaction.addTag("Version", "0.2.1");

    // Add custom tags
    for (const tag of tags) {
      transaction.addTag(tag.name, tag.value);
    }

    try {
      // Sign the transaction first
      const signedTransaction = await window.arweaveWallet.sign(transaction);

      // Verify signature exists
      if (!signedTransaction || !signedTransaction.signature) {
        throw new Error("Transaction was not signed properly");
      }
      const response = await window.arweaveWallet.dispatch(transaction);
      console.log("res dispatch", response);
      // Post the signed transaction using simple post for process creation
      // const response = await arweave.transactions.post(signedTransaction);
      console.log("response", response);
      // if (response.status !== 200 && response.status !== 202) {
      //   throw new Error(`Failed to post transaction: ${response.status}`);
      // }

      console.log("Process spawn transaction completed:", signedTransaction.id);
      return signedTransaction.id;
    } catch (error) {
      console.error("Transaction signing/posting error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error spawning process:", error);
    throw error;
  }
};

export async function messageAR({
  tags = [],
  data,
  anchor = "",
  process,
}: {
  tags?: any[];
  data: any;
  anchor?: string;
  process: string;
}) {
  if (!isClient) return;

  try {
    const { message, createDataItemSigner } = await import(
      "@permaweb/aoconnect"
    );

    if (!process) throw new Error("Process ID is required.");
    if (!data) throw new Error("Data is required.");

    // Format message data for AO
    // const messageData = JSON.stringify({
    //   Input: {
    //     Action: tags.find(t => t.name === 'Action')?.value || 'Message',
    //     ...data,
    //     Module: AOModule,
    //     Scheduler: AOScheduler
    //   }
    // });

    const allTags = [
      { name: "Protocol", value: "AO" },
      { name: "Module", value: AOModule },
      { name: "Scheduler", value: AOScheduler },
      { name: "Target", value: process },
      { name: "Version", value: "0.2.1" },
      ...tags,
    ];

    const messageId = await message({
      process,
      data,
      // anchor,
      tags: allTags,
      signer: createDataItemSigner(window.arweaveWallet),
    });

    console.log("Message sent successfully:", messageId);
    return messageId;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}
