import React from 'react';

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
      <input
        id='familyOnly'
        name='familyOnly'
        type='checkbox'
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className='w-6 h-6'
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
