import { Suspense } from 'react';
import Checking from '@/components/signup/Checking';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Checking />
    </Suspense>
  );
}
