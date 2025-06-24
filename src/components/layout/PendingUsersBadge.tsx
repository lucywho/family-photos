'use client';

import { useEffect, useState } from 'react';

export function PendingUsersBadge() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const response = await fetch('/api/admin/pending-users-count');
        if (response.ok) {
          const data = await response.json();
          setPendingCount(data.count);
        }
      } catch (error) {
        console.error('Failed to fetch pending users count:', error);
      }
    }

    fetchPendingCount();
  }, []);

  if (!pendingCount || pendingCount === 0) {
    return null;
  }

  return (
    <div className='absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold'>
      {pendingCount > 99 ? '99+' : pendingCount}
    </div>
  );
}
