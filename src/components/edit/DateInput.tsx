import React from 'react';
import { Button, Input } from '@/components/ui';

interface DateInputProps {
  value: string;
  error?: string | null;
  onChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DateInput({
  value,
  error,
  onChange,
  onClear,
  disabled,
  placeholder,
}: DateInputProps) {
  return (
    <div>
      <label htmlFor='date' className='block font-medium mb-1'>
        Date
      </label>
      <div className='flex gap-2 items-center'>
        <Input
          id='date'
          name='date'
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || 'dd/mm/yyyy'}
          className='w-full border rounded px-3 py-2'
          disabled={disabled}
          aria-describedby='date-help date-error'
        />
        {value && (
          <Button
            type='button'
            variant='secondary'
            size='sm'
            onClick={onClear}
            disabled={disabled}
          >
            Clear
          </Button>
        )}
      </div>
      <div className='flex justify-between text-xs mt-1'>
        <span id='date-help' className='text-muted-foreground'>
          Format: dd/mm/yyyy
        </span>
        {error && (
          <span id='date-error' className='text-destructive'>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
