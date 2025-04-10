import { getWalletAddress } from './arweaveUtils';

export interface TeamCreateOptions {
  name: string;
  description?: string;
}

export const createTeam = async (options: TeamCreateOptions): Promise<string> => {
  try {
    // Ensure wallet is connected
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
      type: 'team-creation'
    };

    // Create transaction
    const arweave = new window.Arweave({
      host: 'arweave.net',
      port: 443,
      protocol: 'https'
    });

    const transaction = await arweave.createTransaction({
      data: JSON.stringify(teamData)
    });

    // Add tags
    transaction.addTag('App-Name', 'CanvasNotesApp');
    transaction.addTag('Content-Type', 'application/json');
    transaction.addTag('Type', 'team-creation');
    transaction.addTag('Team-Name', options.name);

    // Sign transaction
    await window.arweaveWallet.sign(transaction);

    // Post transaction
    const response = await arweave.transactions.post(transaction);
    
    if (response.status === 200 || response.status === 202) {
      return transaction.id;
    } else {
      throw new Error('Failed to post transaction');
    }
  } catch (error: any) {
    console.error('Error creating team:', error);
    throw new Error(error?.message || 'Failed to create team');
  }
}; 