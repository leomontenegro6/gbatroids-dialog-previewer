import { CHAR_MAP_MZM_VANILLA } from '../charmaps/mzm/vanilla';
import { CHAR_MAP_MZM_PROJECTZM } from '../charmaps/mzm/projectzm';
import { CHAR_MAP_MF_VANILLA } from '../charmaps/mf/vanilla';
import { CHAR_MAP_MF_MZMLIKE } from '../charmaps/mf/mzmlike';

/**
 * Gets character mapping based on game type
 */
export const getCharacterMap = (gameType: string) => {
  switch (gameType) {
    case 'mzm-vanilla':
      return CHAR_MAP_MZM_VANILLA;
    case 'mzm-projectzm':
      return CHAR_MAP_MZM_PROJECTZM;
    case 'mf-vanilla':
      return CHAR_MAP_MF_VANILLA;
    case 'mf-mzmlike':
      return CHAR_MAP_MF_MZMLIKE;
    default:
      return CHAR_MAP_MZM_VANILLA;
  }
};

/**
 * Gets font sprite URI from global window object based on game type
 */
export const getFontSpriteUri = (gameType: string): string => {
  const gameKey = gameType.replace(/-/g, '_');
  const fontSpriteUri = (window as any)[`fontSpriteUri_${gameKey}`] || (window as any).fontSpriteUri_mzm_vanilla;
  return fontSpriteUri;
};

/**
 * Gets window sprite URI from global window object based on dialog type
 */
export const getWindowSpriteUri = (dialogType: string): string => {
  const windowUri = (window as any)[`window_${dialogType?.replace('-', '_') ?? 'mfdialog'}_Uri`] || (window as any).window_mfdialog_Uri;
  return windowUri;
};

/**
 * Calculates sprite position for character (grid system: x * 8px, y * 16px)
 */
export const getSpritePosition = (x: number, y: number): { spriteX: number, spriteY: number } => {
  return {
    spriteX: -(x * 8),
    spriteY: -(y * 16)
  };
};

/**
 * Builds CSS class names for character sprite
 */
export const buildSpriteClassNames = (color: string, withBorder: boolean): string => {
  return withBorder 
    ? `char-sprite color-${color} with-border`
    : `char-sprite color-${color}`;
};