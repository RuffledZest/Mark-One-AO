import { BridgeMessage } from 'webext-bridge';

type MessageHandler = (message: BridgeMessage<any>) => Promise<any>;

const messageHandlers: Record<string, MessageHandler> = {
  'auth_request_ready': async (message) => {
    console.log('Auth request received', message);
    return { success: true, type: 'auth_request' };
  },
  'auth_tab_reloaded_ready': async (message) => {
    console.log('Auth tab reloaded', message);
    return { success: true, type: 'tab_reload' };
  },
  'auth_tab_closed_ready': async (message) => {
    console.log('Auth tab closed', message);
    return { success: true, type: 'tab_closed' };
  },
  'auth_active_wallet_change_ready': async (message) => {
    console.log('Active wallet changed', message);
    return { success: true, type: 'wallet_change' };
  },
  'auth_app_disconnected_ready': async (message) => {
    console.log('App disconnected', message);
    return { success: true, type: 'app_disconnect' };
  },
  'auth_chunk_ready': async (message) => {
    console.log('Auth chunk ready', message);
    return { success: true, type: 'chunk_ready' };
  },
  'team_create_ready': async (message) => {
    console.log('Team create request received', message);
    return { success: true, type: 'team_create' };
  },
  'team_create_complete': async (message) => {
    console.log('Team creation completed', message);
    return { success: true, type: 'team_create_complete' };
  }
};

export const setupBackgroundHandlers = () => {
  // Register message handlers
  Object.entries(messageHandlers).forEach(([messageId, handler]) => {
    window.addEventListener('message', async (event) => {
      if (event.data?.id === messageId) {
        try {
          const response = await handler(event.data);
          event.source?.postMessage(
            { 
              id: messageId, 
              response,
              type: response.type,
              success: true 
            }, 
            { targetOrigin: '*' }
          );
        } catch (error: any) {
          console.error(`Error handling ${messageId}:`, error);
          event.source?.postMessage(
            { 
              id: messageId, 
              error: error?.message || 'Unknown error',
              type: 'error',
              success: false 
            }, 
            { targetOrigin: '*' }
          );
        }
      }
    });
  });
}; 