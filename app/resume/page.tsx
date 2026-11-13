import { Suspense } from 'react';
import Resume from '@/components/emails/Resume';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Resume />
    </Suspense>
  );
}
