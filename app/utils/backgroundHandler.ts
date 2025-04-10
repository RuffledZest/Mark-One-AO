import { createBackgroundHandler } from 'webext-bridge';

export const setupBackgroundHandlers = () => {
  const handler = createBackgroundHandler();

  // Handle auth request
  handler.on('auth_request_ready', async () => {
    console.log('Auth request received');
    return { success: true };
  });

  // Handle tab reload
  handler.on('auth_tab_reloaded_ready', async () => {
    console.log('Auth tab reloaded');
    return { success: true };
  });

  // Handle tab close
  handler.on('auth_tab_closed_ready', async () => {
    console.log('Auth tab closed');
    return { success: true };
  });

  // Handle wallet change
  handler.on('auth_active_wallet_change_ready', async () => {
    console.log('Active wallet changed');
    return { success: true };
  });

  // Handle app disconnect
  handler.on('auth_app_disconnected_ready', async () => {
    console.log('App disconnected');
    return { success: true };
  });

  // Handle chunk ready
  handler.on('auth_chunk_ready', async () => {
    console.log('Auth chunk ready');
    return { success: true };
  });

  return handler;
}; 