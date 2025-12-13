import React from 'react';
import { TextSegment } from '../../types';
import { CharacterSprite } from './CharacterSprite';
import { getCharacterMap } from '../../utils/spriteUtils';
import { parseColorTags, processScriptTags } from '../../utils/textProcessing';

interface TextRendererProps {
  text: string;
  gameType: string;
  dialogType: string;
  maxWidth?: number;
}

export const TextRenderer: React.FC<TextRendererProps> = ({ 
  text, 
  gameType, 
  dialogType, 
  maxWidth = 240 
}) => {
  const renderColorSegments = (segments: TextSegment[]) => {
    const sprites = [];
    let currentWidth = 0;
    let spriteIndex = 0;
    
    const charMap = getCharacterMap(gameType);
    
    for (const segment of segments) {
      const chars = segment.text.split('');
      
      for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const charData = charMap[char];
        const charWidth = charData ? charData.width : 4; // Use mapped width or default to 4
        
        // Check if adding this character would exceed the max width
        if (currentWidth + charWidth > maxWidth) {
          return sprites; // Stop rendering if we exceed width
        }
        
        // Add border for MF Dialog and all Multilines variants (not for Twolines)
        const shouldUseBorder = dialogType === 'mfdialog' || (dialogType?.startsWith('multilines') ?? false);
        
        sprites.push(
          <CharacterSprite
            key={spriteIndex}
            char={char}
            gameType={gameType}
            color={segment.color}
            withBorder={shouldUseBorder}
            index={spriteIndex}
          />
        );
        
        currentWidth += charWidth;
        spriteIndex++;
      }
    }
    
    return sprites;
  };

  // First parse color tags and create segments
  const colorSegments = parseColorTags(text);
  
  // Then process script tags (remove hex tags, convert buttons) for each segment
  const processedSegments = colorSegments.map(segment => ({
    ...segment,
    text: processScriptTags(segment.text)
  }));
  
  // Finally render the segments with their colors
  return <>{renderColorSegments(processedSegments)}</>;
};