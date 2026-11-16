import { Suspense } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import LockWall from '@/components/signup/LockWall';

/** Flow C · C-09 · Lock wall (trial ended, not connected): a modal over the locked platform. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Dashboard mode="c" ended overlay={<LockWall />} />
    </Suspense>
  );
}
