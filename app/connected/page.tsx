import { Suspense } from 'react';
import Connected from '@/components/signup/Connected';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Connected />
    </Suspense>
  );
}
