"use client";
import React, { useState, useEffect } from 'react';
import { spawnProcess, messageAR, connectWallet, disconnectWallet, getWalletAddress } from '../utils/arweaveUtils';
import { setupBackgroundHandlers } from '../utils/backgroundHandler';

export default function ArweaveIntegration() {
  const [processId, setProcessId] = useState<string>('');
  const [messageResponse, setMessageResponse] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    // Setup background handlers
    const handler = setupBackgroundHandlers();
    
    // Check wallet connection on mount
    const checkConnection = async () => {
      const address = await getWalletAddress();
      if (address) {
        setIsConnected(true);
        setWalletAddress(address);
      }
    };
    
    checkConnection();

    return () => {
      // Cleanup handler
      handler.dispose();
    };
  }, []);

  const handleSpawnProcess = async (): Promise<void> => {
    try {
      const newProcessId = await spawnProcess('CanvasNotesApp');
      if (newProcessId) {
        setProcessId(newProcessId);
      } else {
        console.error("Failed to spawn process");
        setMessageResponse("Failed to spawn process. Please try again.");
      }
    } catch (error) {
      console.error("Error spawning process:", error);
      setMessageResponse("Error spawning process.");
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!processId) {
      setMessageResponse("Please spawn a process first.");
      return;
    }

    try {
      const messageId = await messageAR({
        process: processId,
        data: { action: "test", content: "Hello from CanvasNotes!" },
        tags: [{ name: "Type", value: "test" }]
      });
      setMessageResponse(`Message sent with ID: ${messageId}`);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessageResponse("Error sending message.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Arweave Integration</h2>
      
      <div className="mb-4">
        <p>Wallet Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        {walletAddress && <p>Address: {walletAddress}</p>}
      </div>

      <div className="space-y-4">
        <button
          onClick={handleSpawnProcess}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Spawn Process
        </button>

        {processId && (
          <div className="mt-4">
            <p>Process ID: {processId}</p>
            <button
              onClick={handleSendMessage}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
            >
              Send Test Message
            </button>
          </div>
        )}

        {messageResponse && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p>{messageResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}