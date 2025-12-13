import React from 'react';

interface ZoomSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export const ZoomSelector: React.FC<ZoomSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="control-group">
      <span className="control-label">Zoom:</span>
      <select
        value={value || 2}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="control-select"
      >
        <option value="1">1x</option>
        <option value="2">2x</option>
        <option value="3">3x</option>
      </select>
    </div>
  );
};