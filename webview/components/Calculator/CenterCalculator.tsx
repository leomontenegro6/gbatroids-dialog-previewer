import React, { useState } from 'react';
import { getCharacterMap } from '../../utils/spriteUtils';
import { parseColorTags, processScriptTags, calculateCenterOffset, toHex } from '../../utils/textProcessing';

interface CenterCalculatorProps {
  strings: string[];
  gameType: string;
  zoom: number;
}

export const CenterCalculator: React.FC<CenterCalculatorProps> = ({ strings, gameType, zoom }) => {
  const [calculatedCenterValues, setCalculatedCenterValues] = useState<{ [lineIndex: number]: string }>({});

  const calculateCenterValue = (lineIndex: number, text: string) => {
    const charMap = getCharacterMap(gameType);
    
    // Parse color tags and process script tags to get the actual text that will be rendered
    const colorSegments = parseColorTags(text);
    const processedSegments = colorSegments.map(segment => ({
      ...segment,
      text: processScriptTags(segment.text)
    }));
    
    // Calculate total width by summing character widths
    let totalWidth = 0;
    for (const segment of processedSegments) {
      const chars = segment.text.split('');
      for (const char of chars) {
        const charData = charMap[char];
        let charWidth = 4;
        if (charData) {
          charWidth = charData.width + (charData.marginRight ?? 0);
        }

        totalWidth += charWidth;
      }
    }
    
    // Calculate center offset: (222 - totalWidth) / 2
    const centerOffset = calculateCenterOffset(totalWidth);
    
    // Convert to hexadecimal (uppercase, 2 digits)
    const hexValue = toHex(centerOffset);
    
    // Update the calculated values state
    setCalculatedCenterValues(prev => ({
      ...prev,
      [lineIndex]: hexValue
    }));
  };

  // Calculate dynamic margin based on zoom
  // Base height for twolines is 70px, so we need to account for the extra space when scaled
  const baseHeight = 70;
  const dynamicMargin = baseHeight * (zoom - 1) + 15; // 15px base margin + scale difference

  return (
    <div 
      className="twolines-controls"
      style={{
        marginTop: `${dynamicMargin}px`
      }}
    >
      <h4>Center Value Calculator</h4>
      {strings.slice(0, 2).map((str, lineIndex) => (
        <div key={lineIndex} className="line-calc-container">
          <span className="line-label">Line {lineIndex + 1}:</span>
          <button 
            onClick={() => calculateCenterValue(lineIndex, str)}
            className="center-calc-button"
            title="Calculate center value for this line"
          >
            📐 Calculate
          </button>
          {calculatedCenterValues[lineIndex] && (
            <span className="calculated-value">Hex: {calculatedCenterValues[lineIndex]}</span>
          )}
        </div>
      ))}
    </div>
  );
};