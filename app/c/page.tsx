import { Suspense } from 'react';
import CreateAccount from '@/components/signup/CreateAccount';

/** Flow C · C-01 · Create account (short). Reuses B-01 with trial copy. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <CreateAccount flow="c" />
    </Suspense>
  );
}
