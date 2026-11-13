import { Suspense } from 'react';
import FindUid from '@/components/signup/FindUid';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FindUid />
    </Suspense>
  );
}
