import React from 'react';
import { Checkbox } from '@/components/ui';

interface FamilyOnlyCheckboxProps {
  value: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function FamilyOnlyCheckbox({
  value,
  onChange,
  disabled,
}: FamilyOnlyCheckboxProps) {
  return (
    <div className='flex items-center gap-2'>
      <Checkbox
        id='familyOnly'
        name='familyOnly'
        checked={value}
        onCheckedChange={(v) => onChange(!!v)}
        disabled={disabled}
        className='size-6'
      />
      <label htmlFor='familyOnly' className='text-sm'>
        Family only
      </label>
      <span className='text-xs text-muted-foreground ml-2'>
        (Only visible to registered users)
      </span>
    </div>
  );
}
