import { useState, useEffect } from 'react';
import { CursorInfo } from '../types';
import { useVsCodeApi } from './useVsCodeApi';

/**
 * Hook for managing configuration state and VS Code communication
 */
export const useConfiguration = () => {
  const [currentLine, setCurrentLine] = useState<CursorInfo | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [game, setGame] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<string | null>(null);
  const { postMessage } = useVsCodeApi();

  useEffect(() => {
    // Listen for messages from the extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      
      if (message.type === 'cursorChange') {
        setCurrentLine(message.data);
      } else if (message.type === 'zoomLevel') {
        setZoom(message.data);
      } else if (message.type === 'gameType') {
        setGame(message.data);
      } else if (message.type === 'dialogType') {
        setDialogType(message.data);
      } else if (message.type === 'updateFontUri') {
        // Update font sprite URI dynamically without reload
        const { gameType, fontSpriteUri } = message.data;
        const gameKey = gameType.replace(/-/g, '_');
        (window as any)[`fontSpriteUri_${gameKey}`] = fontSpriteUri;
      } else if (message.type === 'updateWindowUri') {
        // Update window URI dynamically without reload
        const { dialogType, windowUri } = message.data;
        const windowKey = `window_${dialogType.replace('-', '_')}_Uri`;
        (window as any)[windowKey] = windowUri;
      } else if (message.type === 'reload') {
        // Graceful reload - just refresh the page content
        window.location.reload();
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Request current settings from extension with delay to ensure webview is ready
    // Only request once on mount, not on every postMessage change
    const timeoutId = setTimeout(() => {
      postMessage({ type: 'getZoom' });
      postMessage({ type: 'getGame' });
      postMessage({ type: 'getDialogType' });
    }, 100);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array - only run once on mount

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    postMessage({ type: 'setZoom', zoom: newZoom });
  };

  const handleGameChange = (newGame: string) => {
    setGame(newGame);
    postMessage({ type: 'setGame', data: newGame });
  };

  const handleDialogTypeChange = (newDialogType: string) => {
    setDialogType(newDialogType);
    postMessage({ type: 'setDialogType', data: newDialogType });
  };

  return {
    // State
    currentLine,
    zoom,
    game,
    dialogType,
    
    // Handlers
    handleZoomChange,
    handleGameChange,
    handleDialogTypeChange,
    
    // Configuration loaded check
    isConfigurationLoaded: zoom !== null && game !== null && dialogType !== null
  };
};