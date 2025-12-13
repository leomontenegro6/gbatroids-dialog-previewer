import React from 'react';
import { CursorInfo } from '../../types';
import { TextRenderer } from './TextRenderer';
import { CenterCalculator } from '../Calculator/CenterCalculator';
import { parseColorTags } from '../../utils/textProcessing';
import { getWindowSpriteUri } from '../../utils/spriteUtils';

interface DialogPreviewProps {
  currentLine: CursorInfo;
  gameType: string;
  dialogType: string;
  zoom: number;
}

export const DialogPreview: React.FC<DialogPreviewProps> = ({ 
  currentLine, 
  gameType, 
  dialogType, 
  zoom 
}) => {
  const renderDialogContent = () => {
    if (dialogType === 'mfdialog') {
      // MF Dialog: Always 2 lines, left aligned
      return currentLine.strings.slice(0, 2).map((str, lineIndex) => (
        <div 
          key={lineIndex}
          className="preview-line"
        >
          <TextRenderer 
            text={str} 
            gameType={gameType} 
            dialogType={dialogType}
            maxWidth={240}
          />
        </div>
      ));
    } else if (dialogType?.startsWith('multilines') ?? false) {
      // Multilines: All lines, left aligned
      const totalLines = currentLine.strings.length;
      const containerHeight = 160 - 16; // 160px container minus 8px padding top/bottom
      const lineHeight = 16;
      
      // Calculate vertical centering for black and zerosuit variants
      const shouldCenter = dialogType === 'multilines-black' || dialogType === 'multilines-zerosuit';
      const topMargin = shouldCenter 
        ? Math.max(0, (containerHeight - (totalLines * lineHeight)) / 2)
        : 0;
      
      return (
        <div style={{ marginTop: `${topMargin}px` }}>
          {currentLine.strings.map((str, lineIndex) => (
            <div 
              key={lineIndex}
              className="preview-line"
            >
              <TextRenderer 
                text={str} 
                gameType={gameType} 
                dialogType={dialogType}
                maxWidth={240}
              />
            </div>
          ))}
        </div>
      );
    } else if (dialogType === 'twolines') {
      // Twolines: Up to 2 lines, centered based on hex values
      return currentLine.strings.slice(0, 2).map((str, lineIndex) => {
        // Parse the string to get color segments and center value
        const colorSegments = parseColorTags(str);
        
        // Get center value from the first segment (they all have the same center value)
        const centerValue = colorSegments.length > 0 ? colorSegments[0].centerValue : 0;
        
        return (
          <div 
            key={lineIndex}
            className="preview-line"
            style={{
              paddingLeft: `${centerValue}px`
            }}
          >
            <TextRenderer 
              text={str} 
              gameType={gameType} 
              dialogType={dialogType}
              maxWidth={240}
            />
          </div>
        );
      });
    }
    return null;
  };

  const getContainerHeight = () => {
    if (dialogType === 'mfdialog') return '64px';
    if (dialogType?.startsWith('multilines')) return '160px';
    if (dialogType === 'twolines') return '70px';
    return '64px';
  };

  const getContentPadding = () => {
    if (dialogType === 'mfdialog') return '24px 8px';
    if (dialogType?.startsWith('multilines')) return '8px';
    if (dialogType === 'twolines') return '38px 8px';
    return '16px 8px';
  };

  return (
    <div>
      <div 
        className="preview-container"
        style={{
          backgroundImage: `url("${getWindowSpriteUri(dialogType)}")`,
          transform: `scale(${zoom})`,
          height: getContainerHeight()
        }}
      >
        <div 
          className="preview-content"
          style={{
            padding: getContentPadding()
          }}
        >
          {renderDialogContent()}
        </div>
      </div>

      {/* Center calculation controls for Twolines */}
      {dialogType === 'twolines' && (
        <CenterCalculator 
          strings={currentLine.strings}
          gameType={gameType}
          zoom={zoom}
        />
      )}
    </div>
  );
};