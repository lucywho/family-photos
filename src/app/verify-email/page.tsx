import { VerifySkeleton, VerifyEmailContent } from '@/features/auth/components';
import { Suspense } from 'react';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifySkeleton />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
