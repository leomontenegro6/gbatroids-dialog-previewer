import React from 'react';
import { getCharacterMap, getFontSpriteUri, getSpritePosition, buildSpriteClassNames } from '../../utils/spriteUtils';

interface CharacterSpriteProps {
  char: string;
  gameType: string;
  color?: string;
  withBorder?: boolean;
  index: number;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({ 
  char, 
  gameType, 
  color = 'white', 
  withBorder = false, 
  index 
}) => {
  const charMap = getCharacterMap(gameType);
  const charData = charMap[char];
  
  // If character not found in mapping, return empty space
  if (!charData) {
    return (
      <span
        key={index}
        className="char-sprite"
        style={{
          width: '4px'
        }}
      />
    );
  }
  
  // Calculate sprite position (grid system: x * 8px, y * 16px)
  const { spriteX, spriteY } = getSpritePosition(charData.x, charData.y);
  
  // Get the font sprite URI from global window object based on current game
  const fontSpriteUri = getFontSpriteUri(gameType);
  
  // Build class names - add 'with-border' class only if withBorder is true
  const classNames = buildSpriteClassNames(color, withBorder);
  
  return (
    <span
      key={index}
      className={classNames}
      style={{
        width: `${charData.width}px`,
        backgroundImage: `url("${fontSpriteUri}")`,
        backgroundPosition: `${spriteX}px ${spriteY}px`,
        marginRight: charData.marginRight ? `${charData.marginRight}px` : undefined
      }}
    />
  );
};