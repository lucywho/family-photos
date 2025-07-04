'use client';

import { Button } from '@/shared/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoNavigationProps {
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function PhotoNavigation({
  canNavigatePrevious,
  canNavigateNext,
  onPrevious,
  onNext,
}: PhotoNavigationProps) {
  return (
    <div className='absolute inset-x-0 top-4 -translate-y-1/2 flex justify-between pointer-events-none z-10'>
      <Button
        variant='secondary'
        size='icon'
        className={`pointer-events-auto shadow-lg hover:shadow-xl transition-shadow ${
          !canNavigatePrevious ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={onPrevious}
        disabled={!canNavigatePrevious}
        aria-label='Previous photo'
      >
        <ChevronLeft className='h-6 w-6' />
      </Button>
      <Button
        variant='secondary'
        size='icon'
        className={`pointer-events-auto shadow-lg hover:shadow-xl transition-shadow ${
          !canNavigateNext ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={onNext}
        disabled={!canNavigateNext}
        aria-label='Next photo'
      >
        <ChevronRight className='h-6 w-6' />
      </Button>
    </div>
  );
}
