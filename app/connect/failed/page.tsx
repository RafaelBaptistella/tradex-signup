import { Suspense } from 'react';
import ConnectFailed from '@/components/signup/ConnectFailed';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ConnectFailed />
    </Suspense>
  );
}
