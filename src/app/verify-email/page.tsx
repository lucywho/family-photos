import { VerifySkeleton, VerifyEmailContent } from '@/components/auth';
import { Suspense } from 'react';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifySkeleton />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
