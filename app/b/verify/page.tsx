import { Suspense } from 'react';
import VerifyEmail from '@/components/signup/VerifyEmail';

/** Flow B · B-02 · Verify email. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail flow="b" />
    </Suspense>
  );
}
