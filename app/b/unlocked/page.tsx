import { Suspense } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';

/** Flow B · B-09 · Dashboard · fully unlocked (after A-17 in flow B). */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Dashboard mode="b-unlocked" />
    </Suspense>
  );
}
