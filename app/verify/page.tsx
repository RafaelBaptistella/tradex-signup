import { Suspense } from 'react';
import VerifyEmail from '@/components/signup/VerifyEmail';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}
