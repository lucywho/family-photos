import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Tag {
  id: number;
  name: string;
}

interface TagsSelectorProps {
  tags: string[];
  allTags: Tag[];
  inputValue: string;
  error?: string | null;
  pending?: boolean;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
  onSelect: (tag: string) => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function TagsSelector({
  tags,
  allTags,
  inputValue,
  error,
  pending,
  onInputChange,
  onAdd,
  onRemove,
  onSelect,
  onInputKeyDown,
}: TagsSelectorProps) {
  return (
    <div>
      <label className='block font-medium mb-1'>Tags</label>
      <div className='flex flex-wrap gap-2 mb-2'>
        {tags.length > 0 ? (
          tags.map((tag) => (
            <span
              key={tag}
              className='inline-flex items-center bg-primary text-secondary px-2 py-1 rounded text-xs'
            >
              {tag}
              <button
                type='button'
                className='ml-1 hover:underline'
                onClick={() => onRemove(tag)}
                aria-label={`Remove tag ${tag}`}
              >
                <X size={16} className='text-destructive' />
              </button>
            </span>
          ))
        ) : (
          <span className='text-muted-foreground text-xs'>
            No tags selected
          </span>
        )}
      </div>
      <div className='flex gap-2 mb-2'>
        <input
          type='text'
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onInputKeyDown}
          maxLength={20}
          placeholder='Add or select a tag'
          className='border rounded px-2 py-1'
          disabled={pending}
          aria-label='Add tag'
        />
        <Button
          type='button'
          variant='secondary'
          size='sm'
          onClick={onAdd}
          disabled={pending || !inputValue.trim()}
        >
          Add
        </Button>
      </div>
      {error && <div className='text-destructive text-xs mb-1'>{error}</div>}
      <div className='flex flex-wrap gap-2'>
        {allTags?.length > 0 ? (
          allTags
            .filter((tag) => !tags.includes(tag.name))
            .map((tag) => (
              <button
                key={tag.id}
                type='button'
                className='bg-secondary text-primary px-2 py-1 rounded text-xs hover:bg-primary hover:text-white'
                onClick={() => onSelect(tag.name)}
                disabled={pending}
                aria-label={`select Tag ${tag.name}`}
              >
                {tag.name.toUpperCase()}
              </button>
            ))
        ) : (
          <span className='text-muted-foreground text-xs'></span>
        )}
      </div>
    </div>
  );
}
