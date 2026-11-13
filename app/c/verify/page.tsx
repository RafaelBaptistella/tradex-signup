import { Suspense } from 'react';
import VerifyEmail from '@/components/signup/VerifyEmail';

/** Flow C · C-02 · Verify email. Reuses A-03, step 2 of 2. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail flow="c" />
    </Suspense>
  );
}
