import { Suspense } from 'react';
import CreateAccount from '@/components/signup/CreateAccount';

/** Flow B · B-01 · Create account (short). */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <CreateAccount flow="b" />
    </Suspense>
  );
}
