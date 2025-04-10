import { getWalletAddress, connectWallet, spawnProcess, messageAR } from './arweaveUtils';

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

    // First, spawn a process for the team
    const processId = await spawnProcess(options.name);
    if (!processId) {
      throw new Error('Failed to spawn team process');
    }

    console.log('Team process spawned:', processId);

    // Create team data
    const teamData = {
      name: options.name,
      description: options.description || '',
      creator: walletAddress,
      createdAt: Date.now(),
      type: 'team-creation',
      version: '1.0'
    };

    // Send team creation message to the process
    const messageId = await messageAR({
      process: processId,
      data: teamData,
      tags: [
        { name: 'Action', value: 'CreateTeam' },
        { name: 'Team-Name', value: options.name }
      ]
    });

    console.log('Team creation message sent:', messageId);
    return processId;
  } catch (error: any) {
    console.error('Error creating team:', error);
    throw new Error(error?.message || 'Failed to create team');
  }
}; 