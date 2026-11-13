import { Suspense } from 'react';
import WelcomeBack from '@/components/signup/WelcomeBack';

/** Flow C · C-11 · Reactivation landing. ?session=expired shows the login state. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <WelcomeBack />
    </Suspense>
  );
}
