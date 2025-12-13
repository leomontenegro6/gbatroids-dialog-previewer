import React from 'react';

interface GameSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="control-group">
      <span className="control-label">Game:</span>
      <select
        value={value || 'mzm-vanilla'}
        onChange={(e) => onChange(e.target.value)}
        className="control-select"
      >
        <optgroup label="MZM">
          <option value="mzm-vanilla">MZM (Vanilla)</option>
          <option value="mzm-projectzm">MZM (ProjectZM)</option>
        </optgroup>
        <optgroup label="MF">
          <option value="mf-vanilla">MF (Vanilla)</option>
          <option value="mf-mzmlike">MF (MZM-like)</option>
        </optgroup>
      </select>
    </div>
  );
};