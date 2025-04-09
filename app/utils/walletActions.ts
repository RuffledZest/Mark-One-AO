import { connectWallet, getWalletAddress, spawnProcess, messageAR } from './arweaveUtils';

// Common tags for AO messages
const commonTags = [
  { name: "Name", value: "CanvasNotesApp" },
  { name: "Version", value: "0.2.1" }
];

export const triggerTeamCreationAction = async (teamName: string): Promise<void> => {
  try {
    // First try to get the wallet address to check if already connected
    try {
      await getWalletAddress();
    } catch (error) {
      // If not connected, connect the wallet
      await connectWallet();
    }

    // Spawn a new process for the team
    const processId = await spawnProcess(teamName);
    console.log('Team process spawned:', processId);

    // Send a message to the process using the CreateTeam handler
    const messageId = await messageAR({
      process: processId,
      data: JSON.stringify({ action: 'CreateTeam', name: teamName }),
      tags: [...commonTags, { name: "Action", value: "CreateTeam" }]
    });
    console.log('Team creation message sent:', messageId);
  } catch (error) {
    console.error('Team creation chain action failed:', error);
    // We don't throw the error since we want to continue with the operation
  }
};

export const triggerFileCreationAction = async (fileName: string, teamName: string): Promise<void> => {
  try {
    // First try to get the wallet address to check if already connected
    try {
      await getWalletAddress();
    } catch (error) {
      // If not connected, connect the wallet
      await connectWallet();
    }

    // Spawn a new process for the file
    const processId = await spawnProcess(fileName);
    console.log('File process spawned:', processId);

    // Send a message to the process using the CreateFile handler
    const messageId = await messageAR({
      process: processId,
      data: JSON.stringify({ 
        action: 'CreateFile', 
        name: fileName,
        team_id: teamName // Using teamName as team_id for simplicity
      }),
      tags: [...commonTags, { name: "Action", value: "CreateFile" }]
    });
    console.log('File creation message sent:', messageId);
  } catch (error) {
    console.error('File creation chain action failed:', error);
    // We don't throw the error since we want to continue with the operation
  }
}; 