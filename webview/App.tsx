import React from 'react';
import { useConfiguration } from './hooks/useConfiguration';
import { GameSelector } from './components/Controls/GameSelector';
import { DialogTypeSelector } from './components/Controls/DialogTypeSelector';
import { ZoomSelector } from './components/Controls/ZoomSelector';
import { EmptyState } from './components/shared/EmptyState';
import { DialogPreview } from './components/Preview/DialogPreview';
import './styles.css';

const App: React.FC = () => {
  const {
    currentLine,
    zoom,
    game,
    dialogType,
    handleZoomChange,
    handleGameChange,
    handleDialogTypeChange,
    isConfigurationLoaded
  } = useConfiguration();

  // Don't render anything until configurations are loaded
  if (!isConfigurationLoaded) {
    return (
      <div className="container">
        <EmptyState message="Loading configuration..." />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <div className="controls">
            <GameSelector 
              value={game || 'mzm-vanilla'} 
              onChange={handleGameChange} 
            />
            
            <DialogTypeSelector 
              value={dialogType || 'twolines'} 
              onChange={handleDialogTypeChange} 
            />
            
            <ZoomSelector 
              value={zoom || 2} 
              onChange={handleZoomChange} 
            />
          </div>
        </div>
      </div>
      
      <div>
        {!currentLine ? (
          <EmptyState message="No active editor. Open an assembly file and move your cursor to see block strings." />
        ) : (
          <div>
            {currentLine.blockName && currentLine.strings.length > 0 ? (
              <DialogPreview 
                currentLine={currentLine}
                gameType={game!}
                dialogType={dialogType!}
                zoom={zoom!}
              />
            ) : (
              <div className="no-block-message">
                {currentLine.blockName 
                  ? 'No .stringn entries found in this block'
                  : 'Cursor is not within a block_x_str_y section'
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
