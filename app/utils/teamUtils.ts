import { getWalletAddress, connectWallet } from './arweaveUtils';

export interface TeamCreateOptions {
  name: string;
  description?: string;
}

export const createTeam = async (options: TeamCreateOptions): Promise<string> => {
  try {
    // Ensure wallet is connected with proper permissions
    await connectWallet();

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
      data: JSON.stringify(teamData)
    });

    // Add mandatory tags
    transaction.addTag('App-Name', 'CanvasNotesApp');
    transaction.addTag('Content-Type', 'application/json');
    transaction.addTag('Type', 'team-creation');
    transaction.addTag('Team-Name', options.name);
    transaction.addTag('Version', '1.0');
    transaction.addTag('Creator', walletAddress);

    // Sign and post transaction
    await window.arweaveWallet.sign(transaction);
    await arweave.transactions.post(transaction);

    console.log('Transaction uploaded successfully:', transaction.id);
    return transaction.id;
  } catch (error: any) {
    console.error('Error creating team:', error);
    throw new Error(error?.message || 'Failed to create team');
  }
}; 