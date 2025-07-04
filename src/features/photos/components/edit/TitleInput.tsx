import React from 'react';
import { Input } from '@/shared/components/ui';
import { MAX_TITLE_LENGTH } from '@/shared/constants';

interface TitleInputProps {
  value: string;
  error?: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TitleInput({
  value,
  error,
  onChange,
  disabled,
  placeholder,
}: TitleInputProps) {
  return (
    <div>
      <label htmlFor='title' className='block font-medium mb-1'>
        Title
      </label>
      <Input
        id='title'
        name='title'
        type='text'
        maxLength={MAX_TITLE_LENGTH}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Title'}
        className='w-full border rounded px-3 py-2'
        disabled={disabled}
        aria-describedby='title-help title-error'
      />
      <div className='flex justify-between text-xs mt-1'>
        <span id='title-help' className='text-muted-foreground'>
          {value.length}/{MAX_TITLE_LENGTH} characters
        </span>
        {error && (
          <span id='title-error' className='text-destructive'>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
