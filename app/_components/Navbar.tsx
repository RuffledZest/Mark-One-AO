"use client";

import { Button } from "@/components/ui/button";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useEffect, useState } from "react";
import { getWalletAddress } from "@/app/utils/arweaveUtils";

export default function Navbar() {
  const { user } = useKindeBrowserClient();
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const address = await getWalletAddress();
        setIsWalletConnected(!!address);
      } catch (error) {
        setIsWalletConnected(false);
      }
    };

    checkWalletConnection();
    // Add event listener for wallet connection changes
    window.addEventListener("wallet-connected", checkWalletConnection);
    window.addEventListener("wallet-disconnected", checkWalletConnection);

    return () => {
      window.removeEventListener("wallet-connected", checkWalletConnection);
      window.removeEventListener("wallet-disconnected", checkWalletConnection);
    };
  }, []);

  return (
    <nav className="flex justify-between items-center p-4">
      <div className="flex items-center space-x-2">
        <img src="/logo.svg" alt="logo" className="w-10 h-10" />
        <h1 className="text-white font-bold">MarkOne</h1>
      </div>
      <div className="flex items-center space-x-4">
        {!user ? (
          <>
            {!isWalletConnected ? (
              <Button
                variant="outline"
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={async () => {
                  try {
                    await getWalletAddress();
                    setIsWalletConnected(true);
                  } catch (error) {
                    console.error("Failed to connect wallet:", error);
                  }
                }}
              >
                Connect Wallet
              </Button>
            ) : (
              <>
                <LoginLink>
                  <Button
                    variant="outline"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Login
                  </Button>
                </LoginLink>
                <RegisterLink>
                  <Button
                    variant="outline"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Register
                  </Button>
                </RegisterLink>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <img
              src={user.picture ?? "https://img.freepik.com/free-vector/graphic-designer-man_78370-159.jpg?size=626&ext=jpg&ga=GA1.1.1395880969.1709251200&semt=ais"}
              alt="user picture"
              className="rounded-full h-8 w-8 object-cover"
            />
            <span className="text-white">{user.given_name}</span>
          </div>
        )}
      </div>
    </nav>
  );
} 