import { Suspense } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';

/** Flow C · C-03 · Trial welcome: the day-1 modal over the trial dashboard (first entry after C-02). */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Dashboard mode="c" entry="welcome" />
    </Suspense>
  );
}
