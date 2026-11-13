import { Suspense } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';

/** Flow C · C-04 · Dashboard · trial. ?day=1–7 shows another trial day. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Dashboard mode="c" />
    </Suspense>
  );
}
