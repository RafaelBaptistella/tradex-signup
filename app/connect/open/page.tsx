import { Suspense } from 'react';
import OpenExchange from '@/components/signup/OpenExchange';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OpenExchange />
    </Suspense>
  );
}
