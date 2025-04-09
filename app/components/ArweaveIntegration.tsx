"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { spawnProcess, messageAR, connectWallet, disconnectWallet, getWalletAddress } from '../utils/arweaveUtils';

// Create a dynamic import for the component to ensure it only runs on the client side
const ArweaveIntegration = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [processId, setProcessId] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [messageResponse, setMessageResponse] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (!isClient) return;
    try {
      const address = await getWalletAddress();
      if (address) {
        setWalletAddress(address);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Wallet not connected", error);
      setIsConnected(false);
    }
  };

  const handleConnectWallet = async () => {
    if (!isClient) return;
    try {
      await connectWallet();
      const address = await getWalletAddress();
      setWalletAddress(address);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleDisconnectWallet = async () => {
    if (!isClient) return;
    try {
      await disconnectWallet();
      setWalletAddress('');
      setIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const handleSpawnProcess = async () => {
    if (!isClient) return;
    try {
      const newProcessId = await spawnProcess('CanvasNotesApp');
      setProcessId(newProcessId);
    } catch (error) {
      console.error("Error spawning process:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!isClient) return;
    if (!processId) {
      alert('Please spawn a process first.');
      return;
    }
    try {
      const messageId = await messageAR({ process: processId, data: messageInput });
      setMessageResponse(`Message sent with ID: ${messageId}`);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessageResponse("Error sending message.");
    }
  };

  if (!isClient) {
    return <div>Loading...</div>; // Show a loading state instead of null
  }

  return (
    <section className="py-12 px-6 md:px-24">
      <div className="container mx-auto">
        <h2 className="text-3xl font-semibold text-center text-[#333333] mb-8">Arweave Integration</h2>
        <div className="mb-4">
          {isConnected ? (
            <>
              <p className="text-center text-[#444444] mb-2">Wallet Address: {walletAddress}</p>
              <button onClick={handleDisconnectWallet} className="bg-[#E45858] hover:bg-[#C24545] text-white font-bold py-2 px-4 rounded transition duration-300 block mx-auto">
                Disconnect Wallet
              </button>
            </>
          ) : (
            <button onClick={handleConnectWallet} className="bg-[#BFA180] hover:bg-[#A68A64] text-white font-bold py-2 px-4 rounded transition duration-300 block mx-auto">
              Connect Wallet
            </button>
          )}
        </div>
        <div className="mb-4">
          <button onClick={handleSpawnProcess} className="bg-[#BFA180] hover:bg-[#A68A64] text-white font-bold py-2 px-4 rounded transition duration-300 block mx-auto">
            Spawn Process
          </button>
          {processId && <p className="text-center text-[#444444] mt-2">Process ID: {processId}</p>}
        </div>
        <div className="mb-4">
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Enter message..."
            className="border rounded py-2 px-3 w-full text-[#555555]"
          />
          <button onClick={handleSendMessage} className="bg-[#BFA180] hover:bg-[#A68A64] text-white font-bold py-2 px-4 rounded transition duration-300 block mx-auto mt-2">
            Send Message
          </button>
          {messageResponse && <p className="text-center text-[#444444] mt-2">{messageResponse}</p>}
        </div>
      </div>
    </section>
  );
};

// Export the component with dynamic import
export default dynamic(() => Promise.resolve(ArweaveIntegration), {
  ssr: false,
  loading: () => <div>Loading...</div>
}); 