import React from 'react';
import { cn } from '../lib/utils';

interface ThemedTimePickerProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

export default function ThemedTimePicker({ label, value, onChange, className = '' }: ThemedTimePickerProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-primary-700 mb-2">{label}</label>
      )}
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
} 