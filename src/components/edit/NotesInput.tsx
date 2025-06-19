import React from 'react';
import { MAX_NOTES_LENGTH } from '@/lib/constants';

interface NotesInputProps {
  value: string;
  error?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function NotesInput({
  value,
  error,
  onChange,
  disabled,
  placeholder,
}: NotesInputProps) {
  return (
    <div>
      <label htmlFor='notes' className='block font-medium mb-1'>
        Notes
      </label>
      <textarea
        id='notes'
        name='notes'
        maxLength={MAX_NOTES_LENGTH}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Notes'}
        className='w-full border rounded px-3 py-2 min-h-[100px] resize-y'
        disabled={disabled}
        aria-describedby='notes-help notes-error'
      />
      <div className='flex justify-between text-xs mt-1'>
        <span id='notes-help' className='text-muted-foreground'>
          {value.length}/{MAX_NOTES_LENGTH} characters
        </span>
        {error && (
          <span id='notes-error' className='text-destructive'>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
