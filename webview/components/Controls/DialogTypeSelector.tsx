import React from 'react';

interface DialogTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const DialogTypeSelector: React.FC<DialogTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="control-group">
      <span className="control-label">Dialog type:</span>
      <select
        value={value || 'twolines'}
        onChange={(e) => onChange(e.target.value)}
        className="control-select"
      >
        <option value="mfdialog">MF Dialog</option>
        <option value="twolines">Twolines</option>
        <optgroup label="Multilines">
          <option value="multilines-black">Multilines (Black)</option>
          <option value="multilines-elevator">Multilines (Elevator)</option>
          <option value="multilines-zerosuit">Multilines (Zero Suit)</option>
        </optgroup>
      </select>
    </div>
  );
};