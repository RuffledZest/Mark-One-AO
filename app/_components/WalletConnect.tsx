"use client";
import React, { useState, useEffect } from 'react';
import { connectWallet, disconnectWallet, getWalletAddress } from '../utils/arweaveUtils';
import { Button } from '@/components/ui/button';

export const WalletConnect: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async (): Promise<void> => {
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

  const handleConnectWallet = async (): Promise<void> => {
    try {
      await connectWallet();
      const address = await getWalletAddress();
      setWalletAddress(address);
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleDisconnectWallet = async (): Promise<void> => {
    try {
      await disconnectWallet();
      setWalletAddress('');
      setIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <>
          <span className="text-sm text-white truncate max-w-[100px]">
            {walletAddress}
          </span>
          <Button
            onClick={handleDisconnectWallet}
            variant="outline"
            className="text-cyan-600 border-white hover:bg-white hover:text-black"
          >
            Disconnect
          </Button>
        </>
      ) : (
        <Button
          onClick={handleConnectWallet}
          variant="outline"
          className="text-cyan-600 border-white hover:bg-white hover:text-black"
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
}; 