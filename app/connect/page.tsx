import { Suspense } from 'react';
import BeforeYouStart from '@/components/signup/BeforeYouStart';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BeforeYouStart />
    </Suspense>
  );
}
