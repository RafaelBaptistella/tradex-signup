import { Suspense } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import SoftLockModal from '@/components/dashboard/SoftLockModal';

/** Flow B · B-03 · Dashboard + connect modal (and B-06 underneath once dismissed). */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Dashboard mode="b" overlay={<SoftLockModal />} />
    </Suspense>
  );
}
