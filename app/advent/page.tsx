import { Suspense } from 'react';
import Dashboard from '@/components/dashboard/Dashboard';

/** Advent Calendar (new feature, wireframe): the platform shell with the calendar in the main column. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Dashboard view="advent" />
    </Suspense>
  );
}
