import { useCallback } from 'react';

// Singleton pattern for VS Code API to prevent multiple acquisitions
let vscodeApi: any = null;

const getVsCodeApi = () => {
  if (!vscodeApi) {
    vscodeApi = (window as any).acquireVsCodeApi();
  }
  return vscodeApi;
};

/**
 * Hook for VS Code API communication
 */
export const useVsCodeApi = () => {
  const postMessage = useCallback((message: any) => {
    const vscode = getVsCodeApi();
    vscode.postMessage(message);
  }, []);

  return {
    postMessage,
    getApi: getVsCodeApi
  };
};