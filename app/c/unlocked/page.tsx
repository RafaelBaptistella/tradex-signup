import { Suspense } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';

/** Flow C · C-13 · Dashboard · fully unlocked (right after connecting). */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Dashboard mode="c-unlocked" />
    </Suspense>
  );
}
