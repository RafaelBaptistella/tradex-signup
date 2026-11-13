import { Suspense } from 'react';
import VerifyIdentity from '@/components/signup/VerifyIdentity';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyIdentity />
    </Suspense>
  );
}
