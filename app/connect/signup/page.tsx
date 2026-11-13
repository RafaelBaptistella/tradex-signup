import { Suspense } from 'react';
import SignupOnExchange from '@/components/signup/SignupOnExchange';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignupOnExchange />
    </Suspense>
  );
}
