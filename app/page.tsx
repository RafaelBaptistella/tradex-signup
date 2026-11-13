import { Suspense } from 'react';
import Welcome from '@/components/signup/Welcome';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Welcome />
    </Suspense>
  );
}
