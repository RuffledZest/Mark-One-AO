import { getWalletAddress } from './arweaveUtils';

export interface TeamCreateOptions {
  name: string;
  description?: string;
}

const connectToWallet = async () => {
  try {
    if (window.arweaveWallet) {
      await window.arweaveWallet.connect(['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'DISPATCH'], {
        name: 'CanvasNotesApp',
        logo: 'https://arweave.net/logo.png'
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    return false;
  }
};

export const createTeam = async (options: TeamCreateOptions): Promise<string> => {
  try {
    // Ensure wallet is connected with proper permissions
    const isConnected = await connectToWallet();
    if (!isConnected) {
      throw new Error('Failed to connect to wallet');
    }

    // Get wallet address
    const walletAddress = await getWalletAddress();
    if (!walletAddress) {
      throw new Error('Wallet not connected');
    }

    // Create team data
    const teamData = {
      name: options.name,
      description: options.description || '',
      creator: walletAddress,
      createdAt: Date.now(),
      type: 'team-creation',
      version: '1.0'
    };

    // Create transaction
    const arweave = new window.Arweave({
      host: 'arweave.net',
      port: 443,
      protocol: 'https',
      timeout: 20000,
    });

    // Create and prepare transaction
    const transaction = await arweave.createTransaction({
      data: JSON.stringify(teamData),
      reward: '100000000' // Adequate reward for data size
    });

    // Add mandatory tags
    transaction.addTag('App-Name', 'CanvasNotesApp');
    transaction.addTag('Content-Type', 'application/json');
    transaction.addTag('Type', 'team-creation');
    transaction.addTag('Team-Name', options.name);
    transaction.addTag('Version', '1.0');
    transaction.addTag('Creator', walletAddress);

    try {
      // Sign transaction
      await window.arweaveWallet.sign(transaction);

      // Post to gateway
      const uploader = await arweave.transactions.getUploader(transaction);
      
      while (!uploader.isComplete) {
        await uploader.uploadChunk();
      }

      console.log('Transaction uploaded successfully:', transaction.id);
      return transaction.id;
    } catch (error: any) {
      console.error('Error in transaction signing/upload:', error);
      throw new Error(error?.message || 'Failed to process transaction');
    }
  } catch (error: any) {
    console.error('Error creating team:', error);
    throw new Error(error?.message || 'Failed to create team');
  }
}; 