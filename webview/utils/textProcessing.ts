import { TextSegment } from '../types';

/**
 * Extracts center value from text beginning and returns clean text
 * Looks for hexadecimal values: <XX> where XX is hex
 */
export const extractCenterValue = (text: string): { centerValue: number, cleanText: string } => {
  const hexCenterRegex = /^<([0-9a-fA-F]{2})>/;
  const match = text.match(hexCenterRegex);
  
  if (match) {
    const hexValue = match[1];
    const centerValue = parseInt(hexValue, 16); // Convert hex to decimal
    const cleanText = text.replace(hexCenterRegex, ''); // Remove the center tag
    
    return { centerValue, cleanText };
  }
  
  // If no hex center value found, return 0 and original text
  return { centerValue: 0, cleanText: text };
};

/**
 * Parses color tags in text and returns segments with color information
 */
export const parseColorTags = (text: string): TextSegment[] => {
  const segments: TextSegment[] = [];
  let currentColor = 'white'; // default color
  
  // First extract center value from the beginning of the text
  const { centerValue, cleanText } = extractCenterValue(text);
  
  // Color mappings for named tags only
  const colorMappings: { [key: string]: string } = {
    'yellow': 'yellow',
    'red': 'red',
    'purple': 'purple',
    'green': 'green',
    'blue': 'blue',
    'cyan': 'cyan',
    'white': 'white',
  };
  
  // Regex to match only known color tags
  const colorTagRegex = /<(yellow|red|purple|green|blue|cyan|white)>/gi;
  let lastIndex = 0;
  let match;
  
  while ((match = colorTagRegex.exec(cleanText)) !== null) {
    // Add text segment before this color tag
    if (match.index > lastIndex) {
      const segmentText = cleanText.substring(lastIndex, match.index);
      if (segmentText.length > 0) {
        segments.push({
          text: segmentText,
          color: currentColor,
          centerValue: centerValue,
          startIndex: lastIndex,
          endIndex: match.index
        });
      }
    }
    
    // Update current color based on the tag
    const colorValue = match[1]; // named color
    currentColor = colorMappings[colorValue.toLowerCase()] || currentColor;
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last color tag
  if (lastIndex < cleanText.length) {
    const segmentText = cleanText.substring(lastIndex);
    if (segmentText.length > 0) {
      segments.push({
        text: segmentText,
        color: currentColor,
        centerValue: centerValue,
        startIndex: lastIndex,
        endIndex: cleanText.length
      });
    }
  }
  
  // If no color tags were found, return the whole text as default color
  if (segments.length === 0) {
    segments.push({
      text: cleanText,
      color: 'white',
      centerValue: centerValue,
      startIndex: 0,
      endIndex: cleanText.length
    });
  }
  
  return segments;
};

/**
 * Processes script tags by removing hex tags and converting button tags to Unicode
 */
export const processScriptTags = (text: string): string => {
  // Remove tags that are purely hexadecimal with exactly 2 digits (like <2E>, <80>, etc.)
  // This regex matches tags that contain ONLY 2 hex digits (and optional whitespace)
  let processedText = text.replace(/<\s*[0-9a-fA-F]{2}\s*>/g, '');
  
  // Map button tags to their corresponding characters
  const buttonMappings: { [key: string]: string } = {
    '<A>': 'Ⓐ',
    '<B>': 'Ⓑ',
    '<L>': 'Ⓛ',
    '<R>': 'Ⓡ',
    '<Up>': '⬆',
    '<Down>': '⬇',
    '<Left>': '⬅',
    '<Right>': '➡',
    '<Start>': '▶start',
    '<Select>': '◼',
  };
  
  // Replace button tags with their characters
  Object.entries(buttonMappings).forEach(([tag, char]) => {
    processedText = processedText.replace(new RegExp(tag, 'gi'), char);
  });
  
  return processedText;
};

/**
 * Calculates center value for text centering in dialog
 */
export const calculateCenterOffset = (totalWidth: number, maxWidth: number = 222): number => {
  const centerOffset = Math.floor((maxWidth - totalWidth) / 2);
  return Math.max(0, centerOffset);
};

/**
 * Converts number to uppercase hexadecimal string with padding
 */
export const toHex = (value: number, padding: number = 2): string => {
  return value.toString(16).toUpperCase().padStart(padding, '0');
};