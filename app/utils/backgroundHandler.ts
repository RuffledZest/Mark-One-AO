import { BridgeMessage } from 'webext-bridge';

type MessageHandler = (message: BridgeMessage<any>) => Promise<any>;

const messageHandlers: Record<string, MessageHandler> = {
  'auth_request_ready': async () => {
    console.log('Auth request received');
    return { success: true };
  },
  'auth_tab_reloaded_ready': async () => {
    console.log('Auth tab reloaded');
    return { success: true };
  },
  'auth_tab_closed_ready': async () => {
    console.log('Auth tab closed');
    return { success: true };
  },
  'auth_active_wallet_change_ready': async () => {
    console.log('Active wallet changed');
    return { success: true };
  },
  'auth_app_disconnected_ready': async () => {
    console.log('App disconnected');
    return { success: true };
  },
  'auth_chunk_ready': async () => {
    console.log('Auth chunk ready');
    return { success: true };
  }
};

export const setupBackgroundHandlers = () => {
  // Register message handlers
  Object.entries(messageHandlers).forEach(([messageId, handler]) => {
    window.addEventListener('message', async (event) => {
      if (event.data?.id === messageId) {
        try {
          const response = await handler(event.data);
          event.source?.postMessage({ id: messageId, response }, { targetOrigin: '*' });
        } catch (error: any) {
          console.error(`Error handling ${messageId}:`, error);
          event.source?.postMessage({ id: messageId, error: error?.message || 'Unknown error' }, { targetOrigin: '*' });
        }
      }
    });
  });
}; 