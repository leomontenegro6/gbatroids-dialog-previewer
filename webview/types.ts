// Shared types for the application

// Interface for character data in charmaps
export interface CharacterData {
  x: number;
  y: number;
  width: number;
  marginRight?: number;
}

// Interface for cursor information
export interface CursorInfo {
  fileName: string;
  lineNumber: number;
  column: number;
  blockName: string | null;
  strings: string[];
  timestamp: string;
}

// Interface for text segments with color
export interface TextSegment {
  text: string;
  color: string;
  centerValue: number;
  startIndex: number;
  endIndex: number;
}